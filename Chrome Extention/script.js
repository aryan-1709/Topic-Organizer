document.addEventListener("DOMContentLoaded", () => {
  const addFolderButton = document.getElementById("addFolder");
  const folderNameInput = document.getElementById("folderName");
  const foldersContainer = document.getElementById("foldersContainer");

  const fileViewer = document.getElementById("fileViewer");
  const fileViewerTitle = document.getElementById("fileViewerTitle");
  const fileViewerContent = document.getElementById("fileViewerContent");
  const closeViewerButton = document.getElementById("closeViewer");

  // Load folders from localStorage
  const savedFolders = JSON.parse(localStorage.getItem("folders")) || [];
  savedFolders.forEach((folderData) => {
    const folderElement = createFolder(folderData.name, folderData.files);
    foldersContainer.appendChild(folderElement);
  });

  addFolderButton.addEventListener("click", () => {
    const folderName = folderNameInput.value.trim();
    if (folderName) {
      const folderElement = createFolder(folderName);
      foldersContainer.appendChild(folderElement);
      folderNameInput.value = ""; // Clear input field
      saveFoldersToLocalStorage();
    }
  });

  function createFolder(name, files = []) {
    const folderDiv = document.createElement("div");
    folderDiv.className = "folder";

    const folderTitle = document.createElement("div");
    folderTitle.className = "folderTitle";
    folderTitle.textContent = name;
    folderDiv.appendChild(folderTitle);

    const deleteFolderButton = document.createElement("button");
    deleteFolderButton.textContent = "Delete";
    deleteFolderButton.className = "deleteButton";
    deleteFolderButton.addEventListener("click", () => {
      foldersContainer.removeChild(folderDiv);
      saveFoldersToLocalStorage();
    });
    folderDiv.appendChild(deleteFolderButton);

    const filesContainer = document.createElement("div");
    filesContainer.className = "filesContainer";
    folderDiv.appendChild(filesContainer);

    const fileForm = document.createElement("div");
    fileForm.className = "fileForm";

    const fileTypeDropdown = document.createElement("select");
    fileTypeDropdown.innerHTML = `
      <option value="text">Text</option>
      <option value="link">Link</option>
    `;

    fileTypeDropdown.id = "fileType"

    // Additional styles for select element
    // fileTypeDropdown.style.backgroundColor = "#333"; /* Dark background */
    // fileTypeDropdown.style.color = "#e0e0e0"; /* Light text color */
    // fileTypeDropdown.style.border = "1px solid #555"; /* Dark border */
    // fileTypeDropdown.style.borderRadius = "5px"; /* Rounded corners */
    // fileTypeDropdown.style.padding = "5px"; /* Padding inside select */
    // fileTypeDropdown.style.fontSize = "15px"; /* Font size of the dropdown text */
    // fileTypeDropdown.style.appearance = "none"; /* Remove default appearance */
    // fileTypeDropdown.style.mozAppearance = "none"; /* For Firefox */
    // fileTypeDropdown.style.position = "relative";
    // fileTypeDropdown.style.marginRight = "5px";
    // fileTypeDropdown.style.paddingRight = "25px";
    // fileTypeDropdown.style.paddingTop = "2px";

    fileForm.appendChild(fileTypeDropdown);

    const fileNameInput = document.createElement("input");
    fileNameInput.type = "text";
    fileNameInput.placeholder = "Name for Link/Item";
    fileForm.appendChild(fileNameInput);

    const fileContentInput = document.createElement("input");
    fileContentInput.type = "text";
    fileContentInput.placeholder = "Text or URL";
    fileForm.appendChild(fileContentInput);

    const addFileButton = document.createElement("button");
    addFileButton.textContent = "Add Item";
    fileForm.appendChild(addFileButton);

    fileForm.addEventListener("click", (event) => {
      if (event.target === addFileButton) {
        const fileType = fileTypeDropdown.value;
        const fileName = fileNameInput.value.trim();
        const fileContent = fileContentInput.value.trim();

        if (fileName && fileContent) {
          let fileElement;
          if (fileType === "text") {
            fileElement = createFile(fileName, fileContent);
          } else if (fileType === "link") {
            fileElement = createLink(fileName, fileContent);
          }
          if (fileElement) {
            filesContainer.appendChild(fileElement);
            fileNameInput.value = ""; // Clear input field
            fileContentInput.value = ""; // Clear input field
            saveFoldersToLocalStorage();
          }
        }
      }
    });

    folderDiv.appendChild(fileForm);

    folderDiv.addEventListener("click", (event) => {
      if (
        !fileForm.contains(event.target) &&
        !filesContainer.contains(event.target)
      ) {
        const currentlySelected = document.querySelector(".folder.selected");
        if (currentlySelected && currentlySelected !== folderDiv) {
          currentlySelected.classList.remove("selected");
          currentlySelected.querySelector(".filesContainer").style.display =
            "none";
          currentlySelected.querySelector(".fileForm").classList.remove("visible");
        }

        const isSelected = folderDiv.classList.contains("selected");
        folderDiv.classList.toggle("selected");
        filesContainer.style.display = isSelected ? "none" : "block";
        fileForm.classList.toggle("visible", !isSelected);
      }
    });

    // Load files if any
    files.forEach((file) => {
      let fileElement;
      if (file.type === "text") {
        fileElement = createFile(file.name, file.content);
      } else if (file.type === "link") {
        fileElement = createLink(file.name, file.content);
      }
      if (fileElement) {
        filesContainer.appendChild(fileElement);
      }
    });

    return folderDiv;
  }

  function createFile(name, content) {
    const fileDiv = document.createElement("div");
    fileDiv.className = "file";

    const fileName = document.createElement("div");
    fileName.className = "fileName";
    fileName.textContent = name;
    fileDiv.appendChild(fileName);

    const deleteFileButton = document.createElement("button");
    deleteFileButton.textContent = "Delete";
    deleteFileButton.className = "FiledeleteButton";
    deleteFileButton.addEventListener("click", () => {
      fileDiv.parentNode.removeChild(fileDiv);
      saveFoldersToLocalStorage();
    });
    fileDiv.appendChild(deleteFileButton);

    fileDiv.dataset.content = content; // Save content in data attribute

    fileName.addEventListener("click", () => {
      fileViewerTitle.textContent = name;
      fileViewerContent.textContent = content; // Load content from data attribute
      fileViewer.classList.remove("hidden");
    });

    return fileDiv;
  }

  function createLink(name, url) {
    const linkDiv = document.createElement("div");
    linkDiv.className = "file";

    const linkName = document.createElement("a");
    linkName.className = "LinkfileName"
    linkName.href = url;
    linkName.textContent = name;
    linkName.target = "_blank";
    linkDiv.appendChild(linkName);

    const deleteLinkButton = document.createElement("button");
    deleteLinkButton.textContent = "Delete";
    deleteLinkButton.className = "FiledeleteButton";
    deleteLinkButton.addEventListener("click", () => {
      linkDiv.parentNode.removeChild(linkDiv);
      saveFoldersToLocalStorage();
    });
    linkDiv.appendChild(deleteLinkButton);

    return linkDiv;
  }

  closeViewerButton.addEventListener("click", () => {
    fileViewer.classList.add("hidden");
  });

  function saveFoldersToLocalStorage() {
    const folders = [];
    document.querySelectorAll(".folder").forEach((folderDiv) => {
      const name = folderDiv.querySelector(".folderTitle").textContent;
      const files = [];
      folderDiv.querySelectorAll(".file").forEach((fileDiv) => {
        const fileName =
          fileDiv.querySelector(".fileName")?.textContent ||
          fileDiv.querySelector("a").textContent;
        const fileContent = fileDiv.dataset.content || fileDiv.querySelector("a").href;
        const fileType = fileDiv.querySelector(".fileName") ? "text" : "link";
        files.push({ name: fileName, content: fileContent, type: fileType });
      });
      folders.push({ name, files });
    });
    localStorage.setItem("folders", JSON.stringify(folders));
  }
});
