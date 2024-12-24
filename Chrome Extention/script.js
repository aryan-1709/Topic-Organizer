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

  function truncateName(name, maxLength) {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
  }
  
  function createFolder(name, files = []) {
    const folderDiv = document.createElement("div");
    folderDiv.className = "folder";
  
    const folderTitle = document.createElement("div");
    folderTitle.className = "folderTitle";
    folderTitle.dataset.fullName = name; // Store the full name
    folderTitle.textContent = truncateName(name, 18); // Display truncated name
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
    fileTypeDropdown.id = "fileType";
    fileForm.appendChild(fileTypeDropdown);

    const fileNameInput = document.createElement("input");
    fileNameInput.type = "text";
    fileNameInput.placeholder = "Name for Link/Item";
    fileForm.appendChild(fileNameInput);

    const fileContentInput = document.createElement("textarea");
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
            fileNameInput.value = "";
            fileContentInput.value = "";
            saveFoldersToLocalStorage();
          }
        }
      }
    });

    folderDiv.appendChild(fileForm);
  
    folderDiv.addEventListener("click", (event) => {
      if (!fileForm.contains(event.target) && !filesContainer.contains(event.target)) {
        const currentlySelected = document.querySelector(".folder.selected");
        if (currentlySelected && currentlySelected !== folderDiv) {
          currentlySelected.classList.remove("selected");
          currentlySelected.querySelector(".filesContainer").style.display = "none";
          currentlySelected.querySelector(".fileForm").classList.remove("visible");
  
          // Restore the truncated name for the previously selected folder
          const prevFolderTitle = currentlySelected.querySelector(".folderTitle");
          prevFolderTitle.textContent = truncateName(prevFolderTitle.dataset.fullName, 18);
        }
  
        const isSelected = folderDiv.classList.contains("selected");
        folderDiv.classList.toggle("selected");
        filesContainer.style.display = isSelected ? "none" : "block";
        fileForm.classList.toggle("visible", !isSelected);
  
        // Show full name if selected, otherwise truncated name
        folderTitle.textContent = isSelected ? 
          truncateName(folderTitle.dataset.fullName, 18) : 
          folderTitle.dataset.fullName;
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
    fileName.dataset.fullName = name; // Store the full name
    fileName.textContent = truncateName(name, 27); // Display truncated name
    fileDiv.appendChild(fileName);
  
    const deleteFileButton = document.createElement("button");
    deleteFileButton.textContent = "Delete";
    deleteFileButton.className = "FiledeleteButton";
    deleteFileButton.addEventListener("click", () => {
      fileDiv.parentNode.removeChild(fileDiv);
      saveFoldersToLocalStorage();
    });
    fileDiv.appendChild(deleteFileButton);
  
    fileDiv.dataset.content = content;
  
    fileName.addEventListener("click", () => {
      fileViewerTitle.textContent = name; // Use full name in viewer
      fileViewerContent.textContent = content;
      fileViewer.classList.remove("hidden");
    });
  
    return fileDiv;
  }
  
  function createLink(name, url) {
    const linkDiv = document.createElement("div");
    linkDiv.className = "file";

    const linkName = document.createElement("a");
    linkName.className = "LinkfileName";
    linkName.href = url;
    linkName.dataset.fullName = name; // Store the full name
    linkName.textContent = truncateName(name, 27); // Display truncated name
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
      const folderTitle = folderDiv.querySelector(".folderTitle");
      const name = folderTitle.dataset.fullName; // Use the full name from data attribute
      const files = [];
      folderDiv.querySelectorAll(".file").forEach((fileDiv) => {
        const fileElement = fileDiv.querySelector(".fileName") || fileDiv.querySelector("a");
        const fileName = fileElement.dataset.fullName; // Use the full name from data attribute
        const fileContent = fileDiv.dataset.content || fileElement.href;
        const fileType = fileDiv.querySelector(".fileName") ? "text" : "link";
        files.push({ name: fileName, content: fileContent, type: fileType });
      });
      folders.push({ name, files });
    });
    localStorage.setItem("folders", JSON.stringify(folders));
  }
});