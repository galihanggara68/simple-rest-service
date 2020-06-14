if(localStorage.getItem("config")){
    var config = JSON.parse(localStorage.getItem("config"));
    server.value = config.host;
    objectIdentity.value = config.identity;
    objectTitle.value = config.title;
    listEndpoint.value = config.listEndPoint;
    detailEndpoint.value = config.detailEndPoint;
    addNewEndpoint.value = config.addNewEndPoint;
    updateEndpoint.value = config.updateEndPoint;
    deleteEndpoint.value = config.deleteEndPoint;

    updateListObject();
}

$("#refreshBtn").on("click", () => {
    if(localStorage.getItem("config")){
        updateListObject();
    }else{
        alert("No Configuration");
    }
})

$("#saveChangesBtn").on("click", () => {
    var config = {
        host: server.value,
        identity: objectIdentity.value,
        title: objectTitle.value,
        listEndPoint: listEndpoint.value,
        detailEndPoint: detailEndpoint.value,
        addNewEndPoint: addNewEndpoint.value,
        updateEndPoint: updateEndpoint.value,
        deleteEndPoint: deleteEndpoint.value
    };

    localStorage.setItem("config", JSON.stringify(config));
    updateListObject();
});


$("#addNewBtn").on("click", (e) => {
    const key = $("#listObjects").find(".card .detail-link").attr("key");
    getDetail(key, true, true);
});

$("#frmDetail").on("click", "#btnAdd, #btnUpdate",(e) => {
    const inputs = {};
    var config = JSON.parse(localStorage.getItem("config"));
    Array.from($("#frmDetail input")).map(input => inputs[input.id] = input.value);
    const errors = Object.keys(inputs).filter(input => (input != config.identity ? (inputs[input] != "" ? false : true ) : false));
    if(errors.length > 0){
        errors.forEach((err, i) => {
            $(`#${err}`).addClass("is-invalid");
        });
        return alert("Data is not valid");
    }
    fetch(`${config.host}/${e.target.id == "btnAdd" ? config.addNewEndPoint : config.updateEndPoint}`, {
        method: "POST",
        body: JSON.stringify(inputs)
    })
    .then(res => {
        if(res.status < 300){
            updateListObject();
            const key = $("#listObjects").find(".card .detail-link").attr("key");
            getDetail(key, true, true);
            return res.json();
        }else{
            return "Failed";
        }
    })
    .then(data => alert(data.msg))
    .catch(err => alert(err));
});

$("#listObjects").on("click", ".detail-link", (e) => {
    getDetail(e.target.getAttribute("key"), false);
});

$("#listObjects").on("click", ".update-link", (e) => {
    getDetail(e.target.getAttribute("key"), true);
});

$("#listObjects").on("click", ".delete-link", (e) => {
    if(!confirm("Are You Sure")){
        return false;
    }
    const id = e.target.getAttribute("key");
    var config = JSON.parse(localStorage.getItem("config"));
    var mappedUrl = mapUrl(config.deleteEndPoint, {[config.identity]: id});
    fetch(`${config.host}/${mappedUrl}`, {
        method: "POST",
        body: JSON.stringify(id)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.msg.toUpperCase());
        updateListObject();
    }).catch(err => alert(err));
});

function getDetail(key, isUpdate = false, noVal = false){
    const id = key;
    var config = JSON.parse(localStorage.getItem("config"));
    var mappedUrl = mapUrl(config.detailEndPoint, {[config.identity]: id});
    fetch(`${config.host}/${mappedUrl}`, {
        method: "GET"
    })
    .then(res => res.json())
    .then(data => {
        data = data.msg;
        frmDetail.innerHTML = "";
        var elem = ``;
        var objkeys = Object.keys(data);
        objkeys.forEach((k, i) => {
            elem += `
            <div class="form-group">
                <label for="${k}">${k.toUpperCase()} :</label>
                <input type="text" class="form-control" id="${k}" value="${!noVal ? data[k] : ""}" placeholder="${k.toUpperCase()}" ${isUpdate ? (k==config.identity ? "readonly" : "") : "readonly"}/>
            </div>
            `;
        });
        elem += isUpdate ? `<button class="btn btn-warning" key="${data[config.identity]}" id="${!noVal ? "btnUpdate" : "btnAdd"}">${!noVal ? "Update" : "Add"}</button>` : "";
        frmDetail.innerHTML = elem;
    }).catch(err => alert(err));
}

function mapUrl(url, data){
    return url.replace(/\{(.*)\}/g, (x, offset, str) => data[offset]);
}

function updateListObject(){
    var config = JSON.parse(localStorage.getItem("config"));
    fetch(`${config.host}/${config.listEndPoint}`, {
        method: "GET"
    })
    .then(res => res.json())
    .then(data => {
        data = data.msg;
        listObjects.innerHTML = "";
        data.forEach((d, i) => {
            var keys = Object.keys(d);
            var listItem = `
            <div class="card">
                <div class="card-body">
                <h5 class="card-title">${d[config.title]}</h5>`;
            keys.forEach((k,ik) => {
                if(k != config.title && k != config.identity)
                listItem += `<h6 class="card-subtitle mb-2 text-muted">${d[k]}</h6>`;
            });
            listItem +=
                `<a href="#" key="${d[config.identity]}" class="card-link detail-link">Detail</a>
                <a href="#" key="${d[config.identity]}" class="card-link update-link">Update</a>
                <a href="#" key="${d[config.identity]}" class="card-link text-danger delete-link">Delete</a>
            </div>
            `;

            listObjects.innerHTML += listItem;
        });
    }).catch(err => alert(err));
}