import React, {useState} from 'react';
import './Print.css';
import {useLocation} from "react-router-dom";

const Print = () => {
    const location = useLocation();
    const [order, setOrder] = useState(location.state.order);

    const fixTo2 = (num) => {
        return parseFloat(num).toFixed(2)
    }

    const toLocalISOString = (date = new Date()) => {
        const pad = (n, z = 2) => ('00' + n).slice(-z);
        const tz = -date.getTimezoneOffset();
        const sign = tz >= 0 ? '+' : '-';
        const absTz = Math.abs(tz);
        return date.getFullYear() + '-' +
            pad(date.getMonth() + 1) + '-' +
            pad(date.getDate()) + 'T' +
            pad(date.getHours()) + ':' +
            pad(date.getMinutes()) + ':' +
            pad(date.getSeconds()) + '.' +
            pad(date.getMilliseconds(), 3) +
            sign + pad(Math.floor(absTz / 60)) + ':' + pad(absTz % 60);
    };

    const serviceUUID = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2'; // Use your printer's actual service UUID
    const characteristicUUID = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f'; // Replace with actual write characteristic UUID

    const generateReceipt = (order) => {
        const lineWidth = 32; // Most printers = 32 or 48 chars per line
        let receipt = "";
        
        console.log(order)

        // Helper for padding text
        const pad = (text, width, align = "left") => {
            if (align === "right") return text.toString().padStart(width);
            if (align === "center") {
                const space = width - text.length;
                const padLeft = Math.floor(space / 2);
                const padRight = space - padLeft;
                return " ".repeat(padLeft) + text + " ".repeat(padRight);
            }
            return text.toString().padEnd(width);
        };

        let subtotal = 0;
        const tax = subtotal * order.taxRate;
        const total = subtotal + tax;

        // ESC/POS Commands
        receipt += "\x1B\x40"; // Initialize
        receipt += "\x1B\x21\x30"; // Bold + double size
        receipt += "\n\n\n";
        receipt += "Dixie's Burger\n";
        receipt += "\x1B\x21\x00"; // Normal
        receipt += "-".repeat(lineWidth) + "\n";
        receipt += "\x1B\x21\x30";
        receipt += `${order.tableId} ${order.openedBy.name}\n\n`;
        receipt += "\x1B\x21\x20";
        receipt += `${new Date(order.createdAt).toUTCString()}\n`;
        receipt += "\x1B\x21\x00"; // Normal
        receipt += "\n\n";
        receipt += "-".repeat(lineWidth) + "\n";
        receipt += "-".repeat(lineWidth) + "\n";
        
        order.meals.map(meal => {
            //receipt += `${meal.ref}`; // Meal reference
            meal.meals.map(item => {
                receipt += pad(`${item.meal.name}`, 23, "left");
                receipt += pad(`${fixTo2(item.meal.price)}Eur\n`, 9, "right");
            })
            receipt += `(${meal.message})\n`;
            receipt += "- ".repeat(lineWidth / 2) + "\n";
            receipt += "\x1B\x45\x01"; // Bold
            receipt += pad(`Total`, 12, "left");
            receipt += pad(`${fixTo2(meal.price)}Eur\n`, 20, "right");
            receipt += "\x1B\x21\x00"; // Normal
            receipt += "-".repeat(lineWidth) + "\n\n";
        })
        
        receipt += "\x1B\x21\x20"; // Double size
        receipt += pad("Total:", 6) + pad(`Eur ${fixTo2(order.price)}`, 10, "right") + "\n";
        receipt += "\x1B\x21\x00"; // Normal
        receipt += "-".repeat(lineWidth) + "\n";
        receipt += pad(`${order.createdAt}`, lineWidth, "center") + "\n";
        receipt += pad(`${order._id}`, lineWidth, "center") + "\n";
        receipt += pad(`${new Date().toISOString()}`, lineWidth, "center") + "\n";
        receipt += "\n\n\n";

        return receipt;
    }

    async function writeChunked(characteristic, data, chunkSize = 180) {
        let offset = 0;
        while (offset < data.length) {
            const chunk = data.slice(offset, offset + chunkSize);
            await characteristic.writeValue(chunk);
            offset += chunkSize;
            // Optional: add small delay if printer is slow
            await new Promise(res => setTimeout(res, 50));
        }
    }

    const connectToPrinter = async () => {
        const statusEl = document.getElementById("status");
        try {
            statusEl.textContent = "Requesting device...";
            const device = await navigator.bluetooth.requestDevice({
                filters: [{namePrefix: 'PTP'}], // Adjust based on your device name
                optionalServices: [serviceUUID]
            });

            statusEl.textContent = "Connecting to GATT server...";
            const server = await device.gatt.connect();

            const service = await server.getPrimaryService(serviceUUID);
            const characteristic = await service.getCharacteristic(characteristicUUID);

            statusEl.textContent = "Connected. Sending print command...";

            const receiptText = generateReceipt(order);
            const data = new TextEncoder().encode(receiptText);
            await writeChunked(characteristic, data); // Use chunked sending


            statusEl.textContent = "Printed successfully!";
        } catch (err) {
            console.error(err);
            statusEl.textContent = "Error: " + err.message;
        }
    }

    const displayOrder = (tableOrder) => {
        return (
            <div key={tableOrder.ref} className={'print_order_outer_wrapper'}>
                <div className={'print_order_item_details'}>
                    <div className={"table_order_item_index"}>{tableOrder.ref}</div>
                    <div className={'print_order_item_meals'}>
                        {displayMeals(tableOrder.meals)}
                        {tableOrder.message &&
                            <div className={'print_order_item_meals_message'}>
                                {tableOrder.message}
                            </div>
                        }
                    </div>
                </div>
                <div className={'print_order_item_total'}>
                    <div>Total: </div>
                    <div>{fixTo2(tableOrder.price)} Eur</div>
                </div>
            </div>
        )
    };

    const displayMeals = (meals) => {
        return (meals.map(meal => {
                return (
                    <div key={meal.index} className={'print_order_item'} style={{order: orderItem(meal)}}>
                        <div>{meal.meal.name}</div>
                        <div>{fixTo2(meal.meal.price)} Eur</div>
                    </div>
                )
            })
        )
    };

    const orderItem = (item) => {
        if (item.meal.category === 'burger' || item.meal.category === 'special' || item.meal.category === 'dessert')
            return 1;
        else if (item.meal.category === 'sides')
            return 2;
        else if (item.meal.category === 'dip')
            return 3;
        else return 4;
    }

    return (
        <div className={'print'}>
            <div className={'print_button'} onClick={() => connectToPrinter()}>
                Print!
            </div>
            <div id={'status'}></div>
            <div id={'print_section'} className={'print_content'}>
                <div className={'print_header'}>
                    <div className={'print_header_logo'}>
                        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="39" stroke="black" stroke-width="2"/>
                            <path d="M34.3508 28.0909H35.8636L38.8892 33.1832H39.017L42.0426 28.0909H43.5554L39.6136 34.5043V39H38.2926V34.5043L34.3508 28.0909ZM47.2601 39.1705C46.5214 39.1705 45.8734 38.9947 45.3158 38.6431C44.7619 38.2915 44.3286 37.7997 44.0161 37.1676C43.7072 36.5355 43.5527 35.7969 43.5527 34.9517C43.5527 34.0994 43.7072 33.3555 44.0161 32.7198C44.3286 32.0842 44.7619 31.5906 45.3158 31.239C45.8734 30.8874 46.5214 30.7116 47.2601 30.7116C47.9987 30.7116 48.645 30.8874 49.199 31.239C49.7565 31.5906 50.1898 32.0842 50.4987 32.7198C50.8112 33.3555 50.9675 34.0994 50.9675 34.9517C50.9675 35.7969 50.8112 36.5355 50.4987 37.1676C50.1898 37.7997 49.7565 38.2915 49.199 38.6431C48.645 38.9947 47.9987 39.1705 47.2601 39.1705ZM47.2601 38.0412C47.8212 38.0412 48.2828 37.8974 48.645 37.6097C49.0072 37.3221 49.2753 36.9439 49.4494 36.4751C49.6234 36.0064 49.7104 35.4986 49.7104 34.9517C49.7104 34.4048 49.6234 33.8952 49.4494 33.4229C49.2753 32.9506 49.0072 32.5689 48.645 32.2777C48.2828 31.9865 47.8212 31.8409 47.2601 31.8409C46.699 31.8409 46.2373 31.9865 45.8751 32.2777C45.5129 32.5689 45.2448 32.9506 45.0708 33.4229C44.8968 33.8952 44.8098 34.4048 44.8098 34.9517C44.8098 35.4986 44.8968 36.0064 45.0708 36.4751C45.2448 36.9439 45.5129 37.3221 45.8751 37.6097C46.2373 37.8974 46.699 38.0412 47.2601 38.0412ZM58.0427 35.6548V30.8182H59.2998V39H58.0427V37.6151H57.9574C57.7657 38.0305 57.4674 38.3839 57.0625 38.6751C56.6577 38.9627 56.1464 39.1065 55.5285 39.1065C55.0171 39.1065 54.5625 38.9947 54.1648 38.771C53.7671 38.5437 53.4546 38.2028 53.2273 37.7482C53 37.2901 52.8864 36.7131 52.8864 36.017V30.8182H54.1435V35.9318C54.1435 36.5284 54.3104 37.0043 54.6442 37.3594C54.9816 37.7145 55.4113 37.892 55.9333 37.892C56.2458 37.892 56.5636 37.8121 56.8868 37.6523C57.2135 37.4925 57.4869 37.2475 57.7071 36.9173C57.9308 36.587 58.0427 36.1662 58.0427 35.6548ZM61.6022 39V30.8182H62.8167V32.054H62.9019C63.0511 31.6491 63.321 31.3207 63.7116 31.0685C64.1022 30.8164 64.5426 30.6903 65.0326 30.6903C65.125 30.6903 65.2404 30.6921 65.3789 30.6957C65.5174 30.6992 65.6221 30.7045 65.6931 30.7116V31.9901C65.6505 31.9794 65.5529 31.9634 65.4002 31.9421C65.251 31.9173 65.093 31.9048 64.9261 31.9048C64.5284 31.9048 64.1733 31.9883 63.8608 32.1552C63.5518 32.3185 63.3068 32.5458 63.1257 32.837C62.9481 33.1246 62.8593 33.4531 62.8593 33.8224V39H61.6022ZM33.5818 57V46.0909H34.9028V55.8281H39.9738V57H33.5818ZM45.1727 57.1705C44.434 57.1705 43.786 56.9947 43.2284 56.6431C42.6744 56.2915 42.2412 55.7997 41.9287 55.1676C41.6198 54.5355 41.4653 53.7969 41.4653 52.9517C41.4653 52.0994 41.6198 51.3555 41.9287 50.7198C42.2412 50.0842 42.6744 49.5906 43.2284 49.239C43.786 48.8874 44.434 48.7116 45.1727 48.7116C45.9113 48.7116 46.5576 48.8874 47.1116 49.239C47.6691 49.5906 48.1024 50.0842 48.4113 50.7198C48.7238 51.3555 48.8801 52.0994 48.8801 52.9517C48.8801 53.7969 48.7238 54.5355 48.4113 55.1676C48.1024 55.7997 47.6691 56.2915 47.1116 56.6431C46.5576 56.9947 45.9113 57.1705 45.1727 57.1705ZM45.1727 56.0412C45.7338 56.0412 46.1954 55.8974 46.5576 55.6097C46.9198 55.3221 47.1879 54.9439 47.3619 54.4751C47.536 54.0064 47.623 53.4986 47.623 52.9517C47.623 52.4048 47.536 51.8952 47.3619 51.4229C47.1879 50.9506 46.9198 50.5689 46.5576 50.2777C46.1954 49.9865 45.7338 49.8409 45.1727 49.8409C44.6116 49.8409 44.1499 49.9865 43.7877 50.2777C43.4255 50.5689 43.1574 50.9506 42.9834 51.4229C42.8094 51.8952 42.7224 52.4048 42.7224 52.9517C42.7224 53.4986 42.8094 54.0064 42.9834 54.4751C43.1574 54.9439 43.4255 55.3221 43.7877 55.6097C44.1499 55.8974 44.6116 56.0412 45.1727 56.0412ZM54.1016 60.2386C53.4943 60.2386 52.9723 60.1605 52.5355 60.0043C52.0987 59.8516 51.7347 59.6491 51.4435 59.397C51.1559 59.1484 50.9268 58.8821 50.7564 58.598L51.7578 57.8949C51.8714 58.044 52.0153 58.2145 52.1893 58.4062C52.3633 58.6016 52.6012 58.7702 52.9031 58.9123C53.2085 59.0579 53.608 59.1307 54.1016 59.1307C54.7621 59.1307 55.3072 58.9709 55.7369 58.6513C56.1665 58.3317 56.3814 57.831 56.3814 57.1491V55.4872H56.2749C56.1825 55.6364 56.0511 55.821 55.8807 56.0412C55.7138 56.2578 55.4723 56.4513 55.1562 56.6218C54.8438 56.7887 54.4212 56.8722 53.8885 56.8722C53.228 56.8722 52.6349 56.7159 52.1094 56.4034C51.5874 56.0909 51.1737 55.6364 50.8683 55.0398C50.5664 54.4432 50.4155 53.7187 50.4155 52.8665C50.4155 52.0284 50.5629 51.2987 50.8576 50.6772C51.1523 50.0522 51.5625 49.5692 52.0881 49.2283C52.6136 48.8839 53.2209 48.7116 53.9098 48.7116C54.4425 48.7116 54.8651 48.8004 55.1776 48.978C55.4936 49.152 55.7351 49.3509 55.902 49.5746C56.0724 49.7947 56.2038 49.9759 56.2962 50.1179H56.424V48.8182H57.6385V57.2344C57.6385 57.9375 57.4787 58.5092 57.1591 58.9496C56.843 59.3935 56.4169 59.7184 55.8807 59.9244C55.348 60.1339 54.755 60.2386 54.1016 60.2386ZM54.0589 55.7429C54.5632 55.7429 54.9893 55.6275 55.3374 55.3967C55.6854 55.1658 55.9499 54.8338 56.131 54.4006C56.3121 53.9673 56.4027 53.4489 56.4027 52.8452C56.4027 52.2557 56.3139 51.7354 56.1364 51.2844C55.9588 50.8335 55.696 50.4801 55.348 50.2244C55 49.9687 54.5703 49.8409 54.0589 49.8409C53.5263 49.8409 53.0824 49.9759 52.7273 50.2457C52.3757 50.5156 52.1112 50.8778 51.9336 51.3324C51.7596 51.7869 51.6726 52.2912 51.6726 52.8452C51.6726 53.4134 51.7614 53.9158 51.9389 54.3526C52.12 54.7859 52.3864 55.1268 52.7379 55.3754C53.093 55.6204 53.5334 55.7429 54.0589 55.7429ZM63.2635 57.1705C62.5249 57.1705 61.8768 56.9947 61.3192 56.6431C60.7653 56.2915 60.332 55.7997 60.0195 55.1676C59.7106 54.5355 59.5561 53.7969 59.5561 52.9517C59.5561 52.0994 59.7106 51.3555 60.0195 50.7198C60.332 50.0842 60.7653 49.5906 61.3192 49.239C61.8768 48.8874 62.5249 48.7116 63.2635 48.7116C64.0021 48.7116 64.6484 48.8874 65.2024 49.239C65.7599 49.5906 66.1932 50.0842 66.5021 50.7198C66.8146 51.3555 66.9709 52.0994 66.9709 52.9517C66.9709 53.7969 66.8146 54.5355 66.5021 55.1676C66.1932 55.7997 65.7599 56.2915 65.2024 56.6431C64.6484 56.9947 64.0021 57.1705 63.2635 57.1705ZM63.2635 56.0412C63.8246 56.0412 64.2862 55.8974 64.6484 55.6097C65.0107 55.3221 65.2788 54.9439 65.4528 54.4751C65.6268 54.0064 65.7138 53.4986 65.7138 52.9517C65.7138 52.4048 65.6268 51.8952 65.4528 51.4229C65.2788 50.9506 65.0107 50.5689 64.6484 50.2777C64.2862 49.9865 63.8246 49.8409 63.2635 49.8409C62.7024 49.8409 62.2408 49.9865 61.8786 50.2777C61.5163 50.5689 61.2482 50.9506 61.0742 51.4229C60.9002 51.8952 60.8132 52.4048 60.8132 52.9517C60.8132 53.4986 60.9002 54.0064 61.0742 54.4751C61.2482 54.9439 61.5163 55.3221 61.8786 55.6097C62.2408 55.8974 62.7024 56.0412 63.2635 56.0412ZM34.3728 75V64.0909H35.6938V68.9489H41.5106V64.0909H42.8316V75H41.5106V70.1207H35.6938V75H34.3728ZM48.7362 75.1705C47.9479 75.1705 47.2678 74.9964 46.6961 74.6484C46.1279 74.2969 45.6894 73.8068 45.3804 73.1783C45.075 72.5462 44.9223 71.8111 44.9223 70.973C44.9223 70.1349 45.075 69.3963 45.3804 68.7571C45.6894 68.1143 46.1191 67.6136 46.6695 67.255C47.2235 66.8928 47.8698 66.7116 48.6084 66.7116C49.0345 66.7116 49.4553 66.7827 49.8708 66.9247C50.2863 67.0668 50.6645 67.2976 51.0054 67.6172C51.3463 67.9332 51.618 68.3523 51.8204 68.8743C52.0228 69.3963 52.124 70.0391 52.124 70.8026V71.3352H45.8172V70.2486H50.8456C50.8456 69.7869 50.7533 69.375 50.5686 69.0128C50.3875 68.6506 50.1283 68.3647 49.7909 68.1552C49.4571 67.9457 49.0629 67.8409 48.6084 67.8409C48.1077 67.8409 47.6744 67.9652 47.3087 68.2138C46.9465 68.4588 46.6677 68.7784 46.4724 69.1726C46.2771 69.5668 46.1794 69.9893 46.1794 70.4403V71.1648C46.1794 71.7827 46.286 72.3065 46.499 72.7362C46.7156 73.1623 47.0157 73.4872 47.3992 73.7109C47.7828 73.9311 48.2284 74.0412 48.7362 74.0412C49.0665 74.0412 49.3648 73.995 49.6311 73.9027C49.901 73.8068 50.1336 73.6648 50.3289 73.4766C50.5242 73.2848 50.6752 73.0469 50.7817 72.7628L51.9962 73.1037C51.8683 73.5156 51.6535 73.8778 51.3517 74.1903C51.0498 74.4993 50.6769 74.7408 50.233 74.9148C49.7892 75.0852 49.2902 75.1705 48.7362 75.1705ZM54.0363 75V66.8182H55.2508V68.054H55.336C55.4852 67.6491 55.7551 67.3207 56.1457 67.0685C56.5363 66.8164 56.9767 66.6903 57.4667 66.6903C57.559 66.6903 57.6744 66.6921 57.8129 66.6957C57.9514 66.6992 58.0562 66.7045 58.1272 66.7116V67.9901C58.0846 67.9794 57.9869 67.9634 57.8343 67.9421C57.6851 67.9173 57.5271 67.9048 57.3602 67.9048C56.9624 67.9048 56.6073 67.9883 56.2948 68.1552C55.9859 68.3185 55.7409 68.5458 55.5597 68.837C55.3822 69.1246 55.2934 69.4531 55.2934 69.8224V75H54.0363ZM62.7987 75.1705C62.0104 75.1705 61.3303 74.9964 60.7586 74.6484C60.1904 74.2969 59.7519 73.8068 59.4429 73.1783C59.1375 72.5462 58.9848 71.8111 58.9848 70.973C58.9848 70.1349 59.1375 69.3963 59.4429 68.7571C59.7519 68.1143 60.1816 67.6136 60.732 67.255C61.286 66.8928 61.9323 66.7116 62.6709 66.7116C63.097 66.7116 63.5178 66.7827 63.9333 66.9247C64.3488 67.0668 64.727 67.2976 65.0679 67.6172C65.4088 67.9332 65.6805 68.3523 65.8829 68.8743C66.0853 69.3963 66.1865 70.0391 66.1865 70.8026V71.3352H59.8797V70.2486H64.9081C64.9081 69.7869 64.8158 69.375 64.6311 69.0128C64.45 68.6506 64.1908 68.3647 63.8534 68.1552C63.5196 67.9457 63.1254 67.8409 62.6709 67.8409C62.1702 67.8409 61.7369 67.9652 61.3712 68.2138C61.009 68.4588 60.7302 68.7784 60.5349 69.1726C60.3396 69.5668 60.2419 69.9893 60.2419 70.4403V71.1648C60.2419 71.7827 60.3485 72.3065 60.5615 72.7362C60.7781 73.1623 61.0782 73.4872 61.4617 73.7109C61.8453 73.9311 62.2909 74.0412 62.7987 74.0412C63.129 74.0412 63.4273 73.995 63.6936 73.9027C63.9635 73.8068 64.1961 73.6648 64.3914 73.4766C64.5867 73.2848 64.7377 73.0469 64.8442 72.7628L66.0587 73.1037C65.9308 73.5156 65.716 73.8778 65.4142 74.1903C65.1123 74.4993 64.7394 74.7408 64.2955 74.9148C63.8517 75.0852 63.3527 75.1705 62.7987 75.1705Z" fill="black"/>
                        </svg>
                    </div>
                    <div className={'print_header_company'}>Dixie's Burger</div>
                    <div className={'print_header_details'}>
                        <div className={'print_header_employee'}>Service: {order.openedBy.name}</div>
                        <div className={'print_header_table'}>Table: {order.tableId}</div>
                    </div>
                    <div className={'print_header_time'}>
                        Created: {new Date(order.createdAt).toUTCString()}
                    </div>
                </div>
                <div className={'print_order'}>
                    {order.meals.map(tableOrder => {
                        return displayOrder(tableOrder);
                    })}
                </div>
                <div className={'print_order_summary'}>
                    <div>Order Total:</div>
                    <div>{fixTo2(order.price)} Eur</div>
                </div>
                <div className={'print_order_footer'}>
                    <div>{order.createdAt}</div>
                    <div>{order._id}</div>
                    <div>{toLocalISOString(new Date())}</div>
                </div>
            </div>
        </div>
    );
};

export default Print;