import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./MenuEditor.css";
import { useMeals } from "../context/MealsContext";
import Select from "react-select";

const MenuEditor = () => {
    const { mealsById, refreshMeals, updateMeal, createMeal, reorderMeals } = useMeals();

    const [reorderMode, setReorderMode] = useState(false);
    const [orderedMeals, setOrderedMeals] = useState([]);
    const [dragIndex, setDragIndex] = useState(null);

    // ---- Build categories & selection ------------------------------------------------
    const categories = useMemo(() => {
        const byCat = {};
        Object.values(mealsById || {}).forEach((meal) => {
            if (!byCat[meal.category]) byCat[meal.category] = [];
            byCat[meal.category].push(meal);
        });
        Object.keys(byCat).forEach((k) =>
            byCat[k].sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
            )
        );
        return byCat;
    }, [mealsById]);

    const categoryKeys = useMemo(() => Object.keys(categories), [categories]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (!selectedCategory || !categoryKeys.includes(selectedCategory)) {
            setSelectedCategory(categoryKeys[0] || null);
        }
    }, [categoryKeys, selectedCategory]);

    useEffect(() => {
        refreshMeals?.();
    }, []);

    // whenever category/meals change, seed ordered list by sortIndex (fallback name)
    useEffect(() => {
        if (!selectedCategory) return;
        const list = (categories[selectedCategory] || []).slice()
            .sort((a, b) => (a.sortIndex ?? 1e9) - (b.sortIndex ?? 1e9)
                || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        setOrderedMeals(list);
    }, [categories, selectedCategory]);

    // ---- Horizontal scroll fade for category bar ------------------------------------
    const scrollRef = useRef(null);
    const [hasLeftFade, setHasLeftFade] = useState(false);
    const [hasRightFade, setHasRightFade] = useState(false);

    const updateFades = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const atStart = scrollLeft <= 1;
        const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
        setHasLeftFade(!atStart);
        setHasRightFade(!atEnd);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateFades();
        el.addEventListener("scroll", updateFades, { passive: true });
        window.addEventListener("resize", updateFades);
        return () => {
            el.removeEventListener("scroll", updateFades);
            window.removeEventListener("resize", updateFades);
        };
    }, [categoryKeys.length, updateFades]);

    // ---- Drag & drop reordering -----------------------------------------------------
    const onDragStart = (i) => setDragIndex(i);
    const onDragOver = (e) => e.preventDefault();
    const onDrop = (i) => {
        if (dragIndex === null) return;
        const next = [...orderedMeals];
        const [m] = next.splice(dragIndex, 1);
        next.splice(i, 0, m);
        setOrderedMeals(next);
        setDragIndex(null);
    };

    const saveOrder = async () => {
        if (!selectedCategory) return;
        const ids = orderedMeals.map((m) => m._id);
        await reorderMeals?.({ category: selectedCategory, ids });
        await refreshMeals?.();
        setReorderMode(false);
    };


    // ---- Modal state -----------------------------------------------------------------
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("edit"); // 'edit' | 'create'
    const [draft, setDraft] = useState({ _id: "", name: "", category: "", price: "", available: true });
    const [errors, setErrors] = useState({});

    const openEdit = (meal) => {
        setModalMode("edit");
        setDraft({
            _id: meal._id,
            name: meal.name || "",
            category: meal.category || categoryKeys[0] || "",
            price: meal.price || "",
            available: meal.available !== false, // default true
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setModalMode("create");
        setDraft({
            _id: "",
            name: "",
            // default to the currently selected category (or first available)
            category: selectedCategory || categoryKeys[0] || "",
            price: "",
            available: true,
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    // Basic validation
    const validate = () => {
        const e = {};
        if (!draft.name.trim()) e.name = "Required";
        if (!draft.category || !categoryKeys.includes(draft.category)) {
            e.category = "Choose a category";
        }
        if (draft.price === "" || Number.isNaN(Number(draft.price)) || Number(draft.price) < 0) {
            e.price = "Enter a valid price";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            if (modalMode === "edit") {
                await updateMeal?.({
                    _id: draft._id,
                    name: draft.name.trim(),
                    category: draft.category,
                    price: `${Number(draft.price)}`,
                    available: !!draft.available,
                });
            } else {
                await createMeal?.({
                    name: draft.name.trim(),
                    category: draft.category,
                    price: `${Number(draft.price)}`,
                    available: !!draft.available,
                });
            }
            await refreshMeals?.();
            setSelectedCategory(draft.category);
            closeModal();
        } catch (err) {
            console.error(err);
        }
    };

    // Close on ESC
    useEffect(() => {
        if (!isModalOpen) return;
        const onKey = (e) => e.key === "Escape" && closeModal();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isModalOpen]);

    const handleChange = (field, value) =>
        setDraft((d) => ({ ...d, [field]: value }));

    const handleEditClick = (meal) => openEdit(meal);

    return (
        <div className="menuEditor">
            <div className="menuEditor-headerRow">
                <div className="menuEditor-header">Menu Editor</div>
                <div className="headerActions">
                    <button
                        className={`ghostBtn ${reorderMode ? "activeToggle" : ""}`}
                        onClick={() => setReorderMode((v) => !v)}
                        title="Reorder items"
                    >
                        ⇅ Reorder
                    </button>
                    <button className="primaryBtn" onClick={openCreate}>+ New Meal</button>
                </div>
            </div>

            <div
                className={[
                    "categoryBar",
                    hasLeftFade ? "fade-left" : "",
                    hasRightFade ? "fade-right" : "",
                ].join(" ")}
            >
                <div className="categoryScroll" ref={scrollRef}>
                    {categoryKeys.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={[
                                "categoryButton",
                                selectedCategory === category ? "active" : "",
                            ].join(" ")}
                            title={category}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {reorderMode && (
                <div className="reorderBar">
                    <button className="ghostBtn" onClick={() => { setReorderMode(false); setOrderedMeals([]); }}>
                        Cancel
                    </button>
                    <button className="primaryBtn" onClick={saveOrder}>Save Order</button>
                </div>
            )}

            {selectedCategory && (
                <div className="menuCategory">
                    <ul className={`mealList ${reorderMode ? "reorderOn" : ""}`}>
                        {(orderedMeals.length ? orderedMeals : (categories[selectedCategory] || [])).map((meal, i) => (
                            <li
                                key={meal._id}
                                className={`mealItem ${reorderMode ? "draggable" : ""} mealItem ${meal.available === false ? "isUnavailable" : ""}`}
                                draggable={reorderMode}
                                onDragStart={() => onDragStart(i)}
                                onDragOver={onDragOver}
                                onDrop={() => onDrop(i)}
                            >
                                <div className="mealLeft">
                                    {reorderMode && <span className="dragHandle" aria-hidden>☰</span>}
                                    <span className="mealName" title={meal.name}>{meal.name}</span>
                                </div>
                                <div className="mealRight">
                                    <span className="mealPrice">{meal.price}€</span>
                                    {meal.available === false && <span className="badgeSoldOut">Unavailable</span>}
                                    <button
                                        className="editBtn"
                                        onClick={() => handleEditClick(meal)}
                                        disabled={reorderMode}
                                        title="Edit"
                                    >✎
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                </div>
            )}

            {/* ----- Modal ----- */}
            {isModalOpen && (
                <div
                    className="modalOverlay"
                    onClick={(e) => {
                        if (e.target.classList.contains("modalOverlay")) closeModal();
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mealModalTitle"
                >
                    <div className="modal">
                        <div className="modalHeader">
                            <h3 id="mealModalTitle">
                                {modalMode === "edit" ? "Edit Meal" : "Create New Meal"}
                            </h3>
                            <button className="iconBtn" onClick={closeModal} aria-label="Close">
                                ✕
                            </button>
                        </div>

                        <div className="modalBody">
                            <div className="formRow">
                                <label htmlFor="mealName">Name</label>
                                <input
                                    id="mealName"
                                    className={`input ${errors.name ? "inputError" : ""}`}
                                    value={draft.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="e.g., Cheeseburger"
                                    autoFocus
                                />
                                {errors.name && <div className="errText">{errors.name}</div>}
                            </div>

                            <div className="formRow">
                                <label htmlFor="mealCategory">Category</label>
                                <div className="selectWrap">
                                    <Select
                                        inputId="mealCategory"
                                        classNamePrefix="reactSelect"
                                        value={categoryKeys.map(c => ({
                                            value: c,
                                            label: c
                                        })).find(opt => opt.value === draft.category)}
                                        onChange={opt => handleChange("category", opt?.value)}
                                        options={categoryKeys.map(c => ({value: c, label: c}))}
                                        isDisabled={categoryKeys.length === 0}
                                        placeholder="Select category"
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                background: "#262a33",
                                                borderColor: errors.category ? "#ff6b6b" : "rgba(255,255,255,0.2)",
                                                color: "whitesmoke",
                                                borderRadius: 8,
                                                minHeight: 36,
                                                boxShadow: "none",
                                            }),
                                            menu: base => ({
                                                ...base,
                                                background: "#262a33",
                                                color: "whitesmoke",
                                                borderRadius: 8,
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                background: state.isSelected
                                                    ? "rgba(205, 92, 92, 0.25)"
                                                    : state.isFocused
                                                        ? "rgba(255,255,255,0.08)"
                                                        : "#262a33",
                                                color: "whitesmoke",
                                            }),
                                            singleValue: base => ({
                                                ...base,
                                                color: "whitesmoke",
                                            }),
                                            placeholder: base => ({
                                                ...base,
                                                color: "rgba(255,255,255,0.6)",
                                            }),
                                        }}
                                    />
                                </div>
                                {errors.category && <div className="errText">{errors.category}</div>}
                            </div>
                            <div className="formRow">
                                <label htmlFor="mealPrice">Price (€)</label>
                                <input
                                    id="mealPrice"
                                    className={`input ${errors.price ? "inputError" : ""}`}
                                    value={draft.price}
                                    onChange={(e) => handleChange("price", e.target.value)}
                                    placeholder="e.g., 9.50"
                                />
                                {errors.price && <div className="errText">{errors.price}</div>}
                            </div>
                        </div>

                        <div className="formRow rowInline">
                            <label htmlFor="mealAvailable">Available</label>
                            <label className="switch">
                                <input
                                    id="mealAvailable"
                                    type="checkbox"
                                    checked={!!draft.available}
                                    onChange={(e) => handleChange("available", e.target.checked)}
                                />
                                <span className="slider"/>
                            </label>
                        </div>

                        <div className="modalFooter">
                            <button className="ghostBtn" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="primaryBtn" onClick={handleSave}>
                                {modalMode === "edit" ? "Save Changes" : "Create Meal"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuEditor;
