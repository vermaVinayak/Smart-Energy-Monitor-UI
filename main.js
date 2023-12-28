if ("serial" in navigator) {
    // The Web Serial API is supported.
    console.log("Web Serial supported!");
}

const connectButton = document.getElementById('connectButton');
const sendButton = document.getElementById('sendButton');
const loadStatusIndicator = document.getElementById('load_status');
const voltageContainer = document.getElementById('receivedDataVoltage');
const currentContainer = document.getElementById('receivedDataCurrent');
const powerContainer = document.getElementById('receivedDataPower');

var port;
var reader;




// Event listener for the Connect button
connectButton.addEventListener('click', async () => {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 4800 });
        console.log('Connected to COM port.');

        reader = await port.readable.getReader();
        // continusly read and print the data data
        //setInterval(printData(), 1000);
        printLoop();
    } catch (error) {
        console.error('Failed to connect to the COM port:', error);
    }
});


const readData = async () => {
    try {
        let accumulatedData = '';
        receivingData = true;
        while (receivingData) {
            const { done, value } = await reader.read();
            if (done) {
                reader.releaseLock();
                break;
            } 

            let data = new TextDecoder().decode(value);
            accumulatedData += data;

            if (accumulatedData.includes("\n\r")) {
                // Line ending detected, return the accumulated data
                accumulatedData = accumulatedData.split("\n\r")[0];
                return accumulatedData;
            }

        }
    } catch (error) {
        console.error('Error while reading data:', error);
    }
};

async function printTHREE() {
    return ;
}

// Im going insane 
function printLoop() {

    new Promise((resolve, reject) => {
        // leaning tower of promises
        setTimeout(() => {
            let dataArray = [];
            readData().then((dat0) => {
                dataArray[0] = dat0;
                readData().then((dat1) => {
                    dataArray[1] = dat1;
                    readData().then((dat2) => {
                        dataArray[2] = dat2;
                        resolve(dataArray);
                    });
                });
            });
        }, 1000);
    }).then((strings) => {
        for (let i = 0; i < 3; i++) {
            // extract the number
            let data = strings[i].split(": ")[1].slice(0,5);
            switch(strings[i].charAt(0)){
                case "V":
                    voltageContainer.innerHTML = data;
                    break;
                case "C":
                    currentContainer.innerHTML = data;
                    break;
                case "P":
                    powerContainer.innerHTML = data;
                    break;
            }
        }
        printLoop();
    });
}


sendButton.addEventListener('click', async () => {
    if (port && port.writable) {
        const writer = port.writable.getWriter();
        const data = new Uint8Array([104, 101, 108, 108, 111]); // hello
        writer.write(data);
        writer.releaseLock();
        console.log('Sent: h');
    }

    // Toggle status led on UI
    if (loadStatusIndicator.innerHTML == "🟥") {
        loadStatusIndicator.innerHTML = "🟩";
    } else {
        loadStatusIndicator.innerHTML = "🟥";
    }
});