document.addEventListener('DOMContentLoaded', () => {
    const topicNameInput = document.getElementById('topicName');
    const addTopicButton = document.getElementById('addTopic');
    const topicsContainer = document.getElementById('topicsContainer');

    // Load topics from storage
    chrome.storage.local.get(['topics'], (result) => {
        const topics = result.topics || {};
        console.log('Loaded topics:', topics); // Debugging line
        renderTopics(topics);
    });

    // Add topic button event listener
    addTopicButton.addEventListener('click', () => {
        const topicName = topicNameInput.value.trim();
        if (topicName) {
            chrome.storage.local.get(['topics'], (result) => {
                const topics = result.topics || {};
                if (!topics[topicName]) {
                    topics[topicName] = { links: [], texts: {} };
                    chrome.storage.local.set({ topics }, () => {
                        console.log('Saved new topic:', topics); // Debugging line
                        renderTopics(topics);
                        topicNameInput.value = '';
                    });
                }
            });
        }
    });

    function renderTopics(topics) {
        topicsContainer.innerHTML = '';
        for (const [topic, data] of Object.entries(topics)) {
            const topicDiv = document.createElement('div');
            topicDiv.className = 'topic';

            const dropdown = document.createElement('div');
            dropdown.className = 'dropdown';
            dropdown.textContent = topic;
            dropdown.addEventListener('click', () => {
                const contentDiv = dropdown.nextElementSibling;
                contentDiv.classList.toggle('show');
                if (contentDiv.classList.contains('show')) {
                    renderItems(contentDiv, topic, data);
                }
            });

            const removeTopicButton = document.createElement('button');
            removeTopicButton.textContent = 'Remove Topic';
            removeTopicButton.addEventListener('click', (e) => {
                e.stopPropagation();
                removeTopic(topic);
            });

            topicDiv.appendChild(dropdown);
            topicDiv.appendChild(removeTopicButton);

            const dropdownContent = document.createElement('div');
            dropdownContent.className = 'dropdown-content';

            // Add item form
            const itemForm = document.createElement('div');
            itemForm.className = 'form-group';
            const itemNameInput = document.createElement('input');
            itemNameInput.type = 'text';
            itemNameInput.placeholder = 'Enter name';
            const itemTypeSelect = document.createElement('select');
            const linkOption = document.createElement('option');
            linkOption.value = 'link';
            linkOption.textContent = 'Link';
            const textOption = document.createElement('option');
            textOption.value = 'text';
            textOption.textContent = 'Text';
            itemTypeSelect.appendChild(linkOption);
            itemTypeSelect.appendChild(textOption);
            const itemValueInput = document.createElement('input');
            itemValueInput.type = 'text';
            itemValueInput.placeholder = 'Enter link or text';
            const addItemButton = document.createElement('button');
            addItemButton.textContent = 'Add Item';
            addItemButton.addEventListener('click', () => {
                const itemName = itemNameInput.value.trim();
                const itemType = itemTypeSelect.value;
                const itemValue = itemValueInput.value.trim();
                if (itemName && itemValue) {
                    chrome.storage.local.get(['topics'], (result) => {
                        const topics = result.topics || {};
                        if (topics[topic]) {
                            if (itemType === 'link') {
                                if (!Array.isArray(topics[topic].links)) {
                                    topics[topic].links = [];
                                }
                                topics[topic].links.push({ name: itemName, url: itemValue });
                            } else if (itemType === 'text') {
                                if (typeof topics[topic].texts !== 'object') {
                                    topics[topic].texts = {};
                                }
                                topics[topic].texts[itemName] = itemValue;
                            }
                            chrome.storage.local.set({ topics }, () => {
                                console.log('Saved topics after adding item:', topics); // Debugging line
                                renderTopics(topics);
                                itemNameInput.value = '';
                                itemValueInput.value = '';
                            });
                        }
                    });
                }
            });
            itemForm.appendChild(itemNameInput);
            itemForm.appendChild(itemTypeSelect);
            itemForm.appendChild(itemValueInput);
            itemForm.appendChild(addItemButton);
            topicDiv.appendChild(itemForm);
            topicDiv.appendChild(dropdownContent);
            topicsContainer.appendChild(topicDiv);
        }
    }

    function renderItems(contentDiv, topic, data) {
        contentDiv.innerHTML = ''; // Clear previous content
        // Render links
        if (Array.isArray(data.links)) {
            data.links.forEach(link => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                const itemDropdown = document.createElement('div');
                itemDropdown.className = 'item-dropdown';
                itemDropdown.textContent = link.name;
                itemDropdown.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!itemDropdown.querySelector('a')) {
                        const linkElement = document.createElement('a');
                        linkElement.href = link.url;
                        linkElement.target = '_blank';
                        linkElement.textContent = 'Go to Link';
                        linkElement.classList.add('show');
                        itemDropdown.appendChild(linkElement);
                    }
                });
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeItem(topic, link.url, 'links');
                });
                itemDiv.appendChild(itemDropdown);
                itemDiv.appendChild(removeButton);
                contentDiv.appendChild(itemDiv);
            });
        }

        // Render texts
        if (typeof data.texts === 'object') {
            Object.entries(data.texts).forEach(([textName, textContent]) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                const itemDropdown = document.createElement('div');
                itemDropdown.className = 'item-dropdown';
                itemDropdown.textContent = textName;
                itemDropdown.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!itemDropdown.querySelector('p')) {
                        const textElement = document.createElement('p');
                        textElement.textContent = textContent;
                        textElement.classList.add('show');
                        itemDropdown.appendChild(textElement);
                    }
                });
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeItem(topic, textName, 'texts');
                });
                itemDiv.appendChild(itemDropdown);
                itemDiv.appendChild(removeButton);
                contentDiv.appendChild(itemDiv);
            });
        }
    }

    function removeTopic(topic) {
        chrome.storage.local.get(['topics'], (result) => {
            const topics = result.topics || {};
            delete topics[topic];
            chrome.storage.local.set({ topics }, () => {
                console.log('Removed topic:', topic); // Debugging line
                renderTopics(topics);
            });
        });
    }

    function removeItem(topic, item, type) {
        chrome.storage.local.get(['topics'], (result) => {
            const topics = result.topics || {};
            if (type === 'links') {
                topics[topic].links = topics[topic].links.filter(link => link.url !== item);
            } else if (type === 'texts') {
                delete topics[topic].texts[item];
            }
            chrome.storage.local.set({ topics }, () => {
                console.log('Removed item:', item); // Debugging line
                renderTopics(topics);
            });
        });
    }
});
