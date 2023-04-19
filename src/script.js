
let fileEl = document.getElementById("saved-path");

Dropzone.options.myGreatDropzone = {
    url: "script.js",
    paramName: "file",
    maxFilesize: 2,
    clickable:"#dropZone",
    addRemoveLinks: true,
    autoProcessQueue: true, 
    init: function () {
        this.on("addedfile", function (file) {
            console.log("Added file:", file.name);
        });
        this.on("complete", function (file) {
            console.log("Complete:", file.name);
        });
        this.on("removedfile", function (file) {
            fileEl.innerHTML = "";
            console.log("Removed file:", file.name);
        });
        this.on("queuecomplete", function () {
            console.log("All files uploaded");
            processFiles(this.files);
        });
    },
};

async function processFiles(files) {
    let combinedData = [];

    for (const file of files) {
        const fileName = file.name;
        // Match the date and time string with regular expressions
        const match = fileName.match(/(\d{2}-\d{2}-\d{2})_(\d{2})-(\d{2})/);

        // Extract the date and time components from the match array
        const [_, date, hour, minute] = match;

        // Convert the hour component to 12-hour format
        const period = hour < 12 ? "AM" : "PM";
        const hour12 = hour % 12 || 12;

        // Format the date and time into the desired format
        const formattedDate = `${date.slice(0, 2)}/${date.slice(3, 5)}/${date.slice(6, 8)}`;
        const formattedTime = `${hour12}:${minute}${period}`;

        // Combine the formatted date and time into the desired string
        const daytime = `${formattedDate} ${formattedTime}`;
        const reader = new FileReader();
        reader.readAsText(file);

        const parsedData = await new Promise(resolve => {
            reader.onload = () => {
                const data = Papa.parse(reader.result, {
                    header: true,
                    skipEmptyLines: true,
                }).data;
                resolve(data);
            };
        });

        let TECKey = Object.keys(parsedData[0])[1];
        let line = 0;
        const modifiedData = parsedData.map(row => {
            if (
                row["TEC Name:"] ===
                " ****************************************** End of Report *******************************************" ||
                !row[Object.keys(row)[1]].includes(":") ||
                (row[Object.keys(row)[0]] === "" &&
                    row[Object.keys(row)[1]] === "" &&
                    row[Object.keys(row)[2]] === "" &&
                    row[Object.keys(row)[3]] === "" &&
                    row[Object.keys(row)[4]] === "")
            ) {
                return { tecName: "", subpoint: "", value: "" };
            } else {
                const splits = row[TECKey].split(":");
                const TECName = splits[0];
                const subpoint = splits[1];
                let value = row[Object.keys(row)[4]];
                const unit = row["__parsed_extra"][1];
                if (unit.includes("*F*")) {
                    value += " *F*";
                }
                return { TECName, subpoint, value, daytime };
            }
        });

        combinedData = combinedData.concat(modifiedData);
    }

    const content = Papa.unparse(combinedData, {
        header: true,
    });

    const res = await api.createNote({
        title: "Combined Data",
        content,
    });

    console.log(res.success);
    if (res.success) {
        fileEl.innerHTML = "saved at " + res.filePath;
    }
    console.log(res);
}