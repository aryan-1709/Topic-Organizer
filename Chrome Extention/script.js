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
    folderTitle.dataset.fullName = name; // Store the full name in a data attribute
    folderTitle.textContent = truncateName(name, 20);
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
  
    // The rest of your createFolder code remains unchanged
  
    folderDiv.addEventListener("click", (event) => {
      if (!fileForm.contains(event.target) && !filesContainer.contains(event.target)) {
        const currentlySelected = document.querySelector(".folder.selected");
        if (currentlySelected && currentlySelected !== folderDiv) {
          currentlySelected.classList.remove("selected");
          currentlySelected.querySelector(".filesContainer").style.display = "none";
          currentlySelected.querySelector(".fileForm").classList.remove("visible");
  
          // Restore the truncated name when another folder is selected
          const folderTitle = currentlySelected.querySelector(".folderTitle");
          folderTitle.textContent = truncateName(folderTitle.dataset.fullName, 20);
        }
  
        const isSelected = folderDiv.classList.contains("selected");
        folderDiv.classList.toggle("selected");
        filesContainer.style.display = isSelected ? "none" : "block";
        fileForm.classList.toggle("visible", !isSelected);
  
        // Show full name if selected, otherwise truncated name
        folderTitle.textContent = isSelected ? truncateName(name, 20) : name;
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
    fileName.textContent = truncateName(name, 22);
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
