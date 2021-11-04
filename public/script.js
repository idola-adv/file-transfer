if (typeof String.prototype.replaceAll === "undefined") {
  String.prototype.replaceAll = function (match, replace) {
    return this.replace(new RegExp(match, "g"), () => replace);
  };
}

const showMessage = (message, type) => {
  const cssClass = `alert-${type}`;
  const messageEl = document.querySelector("#message");
  messageEl.classList.remove("d-none");
  messageEl.classList.add(cssClass);
  messageEl.innerHTML = message;
  setTimeout(() => {
    messageEl.classList.add("d-none");
    messageEl.classList.remove(cssClass);
  }, 5000);
};

const uploadedAction = (data) => {
  console.log(data);
  showMessage(data.message, data.status);
};

// ===========================================

const modalSelesai = () => {
  Swal.fire({
    icon: "success",
    title: "Udah nyampe bosque",
    confirmButtonText: '<i class="fa fa-thumbs-up"></i> Uyee!',
    confirmButtonColor: "#ff5e00",
  });
};
const filenameToId = (id) => {
  return String(id)
    .replaceAll(" ", "_")
    .replaceAll("#", "_")
    .replaceAll("@", "_")
    .replaceAll("!", "_")
    .replaceAll("%", "_")
    .replaceAll("$", "_")
    .replaceAll("^", "_")
    .replaceAll("&", "_")
    .replaceAll("*", "_")
    .replaceAll("-", "_")
    .replaceAll(".", "_")
    .replaceAll("(", "_")
    .replaceAll(")", "_")
    .replaceAll("[", "_")
    .replaceAll("]", "_")
    .replaceAll("{", "_")
    .replaceAll("}", "_")
    .replaceAll("+", "_")
    .replaceAll("'", "_")
    .replaceAll('"', "_");
};
const uploadProgress = (list_file) => {
  let html = "";
  for (let i = 0; i < list_file.length; i++) {
    const file = list_file[i];
    html += `\
    <div>
        ${file.name}
    </div>
    <div class="progress">
      <div id="${filenameToId(
        file.name
      )}" class="progress-bar" role="progressbar" style="width: 10%; background-color: #ff5e00;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">10%</div>
    </div>`;
  }
  Swal.fire({
    imageUrl: "/loading.webp",
    imageAlt: "Loading gaes...",
    html,
    allowOutsideClick: false,
    showCloseButton: false,
    showCancelButton: false,
    showConfirmButton: false,
  });
};
const changeProgressValue = (id, value) => {
  const progress = value + "%";
  document.getElementById(id).innerHTML = progress;
  document.getElementById(id).style.width = progress;
};

// ===========================================

function upload(list_file) {
  if (list_file.length > 0) uploadProgress(list_file);
  const selesai = [];
  for (let i = 0; i < list_file.length; i++) {
    const file = list_file[i];
    const data = new FormData();
    data.append("files", file);
    const url = "/upload";

    // ==========================

    let request = new XMLHttpRequest();
    request.open("POST", url);
    // upload progress event
    request.upload.addEventListener("progress", function (e) {
      // upload progress as percentage
      const percent_completed = (e.loaded / e.total) * 100;
      changeProgressValue(
        filenameToId(file.name),
        percent_completed.toFixed(1)
      );
    });
    // request finished event
    request.addEventListener("load", function (e) {
      // HTTP status message (200, 404 etc)
      // console.log(request.status);
      // request.response holds response from the server
      console.log(request.response);
      selesai.push(file.name);
      if (selesai.length >= list_file.length) {
        audioSukses();
        modalSelesai();
      }
    });
    // send POST request to server
    request.send(data);
  }
}

const audioSukses = () => {
  var audio = new Audio("/sukses.mp3");
  audio.play();
};

// ===================================================

//selecting all required elements
const dropArea = document.querySelector(".drag-area"),
  dragText = dropArea.querySelector("header"),
  button = dropArea.querySelector("button"),
  input = dropArea.querySelector("input");

button.onclick = () => {
  input.click(); //if user click on the button then the input also clicked
};

input.addEventListener("change", function (event) {
  const files = event.target.files;
  //getting user select file and [0] this means if user select multiple files then we'll select only the first one
  dropArea.classList.add("active");

  upload(document.querySelector("#upfile-2").files);
});

//If user Drag File Over DropArea
dropArea.addEventListener("dragover", (event) => {
  event.preventDefault(); //preventing from default behaviour
  dropArea.classList.add("active");
  dragText.textContent = "Release to Upload File";
});

//If user leave dragged File from DropArea
dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active");
  dragText.textContent = "Drag & Drop to Upload File";
});

//If user drop File on DropArea
dropArea.addEventListener("drop", (event) => {
  event.preventDefault(); //preventing from default behaviour
  //getting user select file and [0] this means if user select multiple files then we'll select only the first one
  list_file = event.dataTransfer.files;

  upload(list_file);
});
