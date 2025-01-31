let messages = [];
let selectedMessage = null;
let autoTime = true;
let currentUser = 'User';
let lastSeenStatus = 'last seen today';

// Initialize
loadData();
updateUI();

// Event Listeners
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('docUpload').addEventListener('change', handleDocUpload);
document.getElementById('profileUpload').addEventListener('change', updateProfilePic);
document.getElementById('manualTime').addEventListener('change', updateManualTime);

function sendMessage(sender) {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    if (!content) return;

    const message = {
        id: Date.now(),
        sender,
        type: 'text',
        content,
        time: getCurrentTime()
    };

    messages.push(message);
    input.value = '';
    updateUI();
    saveData();
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        messages.push({
            id: Date.now(),
            sender: 'user1',
            type: 'image',
            content: reader.result,
            time: getCurrentTime()
        });
        updateUI();
        saveData();
    };
    reader.readAsDataURL(file);
}

function handleDocUpload(e) {
    const file = e.target.files[0];
    messages.push({
        id: Date.now(),
        sender: 'user1',
        type: 'document',
        content: {
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB'
        },
        time: getCurrentTime()
    });
    updateUI();
    saveData();
}

function updateUI() {
    const area = document.getElementById('messageArea');
    area.innerHTML = messages.map(msg => `
        <div class="message ${msg.sender} ${selectedMessage === msg.id ? 'selected' : ''}" 
             id="msg-${msg.id}" ondblclick="selectMessage(${msg.id})">
            ${msg.type === 'image' ?
            `<img src="${msg.content}" class="image-message">` :
            msg.type === 'document' ?
                `<div class="document-message">
                    📄 ${msg.content.name}<br>
                    <small>${msg.content.size}</small>
                </div>` :
                msg.content}
            <span class="time-stamp">${msg.time}</span>
        </div>
    `).join('');

    document.getElementById('userName').textContent = currentUser;
    document.getElementById('lastSeen').textContent = lastSeenStatus;
}

function selectMessage(id) {
    if (selectedMessage === id) return;
    selectedMessage = id;
    document.getElementById('deselectBtn').style.display = 'block';
    updateUI();
}

function deselectMessage() {
    selectedMessage = null;
    document.getElementById('deselectBtn').style.display = 'none';
    updateUI();
}

function deleteMessage() {
    messages = messages.filter(msg => msg.id !== selectedMessage);
    deselectMessage();
    saveData();
}

function clearChats() {
    messages = [];
    updateUI();
    saveData();
}

function cleanAll() {
    localStorage.clear();
    currentUser = 'User';
    lastSeenStatus = 'last seen today';
    messages = [];
    document.getElementById('profilePic').src = 'data:image/png;base64,iVBORw0...';
    updateUI();
}

function updateUsername() {
    const newName = document.getElementById('newName').value;
    if (newName) {
        currentUser = newName;
        saveData();
        updateUI();
    }
}

function updateStatus() {
    const status = document.getElementById('statusInput').value;
    if (status) {
        lastSeenStatus = status;
        saveData();
        updateUI();
    }
}

function updateProfilePic(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        document.getElementById('profilePic').src = reader.result;
        saveData();
    };
    reader.readAsDataURL(file);
}

function toggleTime(auto) {
    autoTime = auto;
    document.getElementById('manualTime').disabled = auto;
}

function updateManualTime(e) {
    if (!autoTime) {
        // Update all messages time if needed
    }
}

function getCurrentTime() {
    return autoTime ?
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
        document.getElementById('manualTime').value || '10:00 AM';
}

function downloadScreenshot() {
    html2canvas(document.querySelector('.phone-window')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'whatsapp-chat.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

function saveData() {
    const data = {
        messages,
        currentUser,
        lastSeenStatus,
        profilePic: document.getElementById('profilePic').src
    };
    localStorage.setItem('whatsappData', JSON.stringify(data));
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('whatsappData'));
    if (data) {
        messages = data.messages || [];
        currentUser = data.currentUser || 'User';
        lastSeenStatus = data.lastSeenStatus || 'last seen today';
        document.getElementById('profilePic').src = data.profilePic || 'data:image/png;base64,iVBORw0...';
    }
}
 // Update time format to 12-hour
 function getCurrentTime() {
    return autoTime ?
        new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }) :
        document.getElementById('manualTime').value || '10:00 AM';
}

// Update message rendering for replies
function updateUI() {
    const area = document.getElementById('messageArea');
    area.innerHTML = messages.map(msg => {
        const quotedMessage = messages.find(m => m.id === msg.replyTo);
        return `
       <div class="message ${msg.sender} ${selectedMessage === msg.id ? 'selected' : ''}" 
            id="msg-${msg.id}" ondblclick="selectMessage(${msg.id})">
           ${msg.replyTo ? `
               <div class="quoted-message">
                   <div class="quoted-sender">
                       ${quotedMessage ? (quotedMessage.sender === 'user1' ? 'You' : 'User2') : 'Deleted message'}
                   </div>
                   ${quotedMessage ?
                    (quotedMessage.type === 'text' ? quotedMessage.content :
                        quotedMessage.type === 'image' ? '📷 Photo' :
                            quotedMessage.type === 'document' ? '📄 ' + quotedMessage.content.name : '')
                    : ''}
               </div>
           ` : ''}
           ${msg.type === 'image' ?
                `<img src="${msg.content}" class="image-message">` :
                msg.type === 'document' ?
                    `<div class="document-message">
                   📄 ${msg.content.name}<br>
                   <small>${msg.content.size}</small>
               </div>` :
                    msg.content}
           <span class="time-stamp">${msg.time}</span>
       </div>
       `;
    }).join('');

    document.getElementById('userName').textContent = currentUser;
    document.getElementById('lastSeen').textContent = lastSeenStatus;
}

// Update sendMessage function to include original sender
function sendMessage(sender) {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    if (!content) return;

    const message = {
        id: Date.now(),
        sender,
        type: 'text',
        content,
        time: getCurrentTime(),
        replyTo: selectedMessage,
        replySender: messages.find(m => m.id === selectedMessage)?.sender
    };

    messages.push(message);
    input.value = '';
    selectedMessage = null;
    document.getElementById('deselectBtn').style.display = 'none';
    updateUI();
    saveData();
}
  // Update time handling
  let manualHour = '10';
  let manualMin = '00';
  let manualPeriod = 'AM';

  function getCurrentTime() {
      if (autoTime) {
          return new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
          });
      } else {
          return `${manualHour.padStart(2, '0')}:${manualMin.padStart(2, '0')} ${manualPeriod}`;
      }
  }

  // Update manual time controls
  document.getElementById('manualHour').addEventListener('change', function (e) {
      manualHour = Math.max(1, Math.min(12, parseInt(e.target.value) || 1)).toString();
      e.target.value = manualHour;
  });

  document.getElementById('manualMin').addEventListener('change', function (e) {
      manualMin = Math.max(0, Math.min(59, parseInt(e.target.value) || 0)).toString().padStart(2, '0');
      e.target.value = manualMin;
  });

  document.getElementById('manualPeriod').addEventListener('change', function (e) {
      manualPeriod = e.target.value;
  });

  function toggleTime(auto) {
      autoTime = auto;
      document.getElementById('manualTimeContainer').style.display = auto ? 'none' : 'flex';
  }

  // Update message storage
  function saveData() {
      const data = {
          messages,
          currentUser,
          lastSeenStatus,
          profilePic: document.getElementById('profilePic').src,
          autoTime,
          manualHour,
          manualMin,
          manualPeriod
      };
      localStorage.setItem('whatsappData', JSON.stringify(data));
  }

  function loadData() {
      const data = JSON.parse(localStorage.getItem('whatsappData'));
      if (data) {
          messages = data.messages || [];
          currentUser = data.currentUser || 'User';
          lastSeenStatus = data.lastSeenStatus || 'last seen today';
          document.getElementById('profilePic').src = data.profilePic || 'data:image/png;base64,iVBORw0...';
          autoTime = data.autoTime !== undefined ? data.autoTime : true;
          manualHour = data.manualHour || '10';
          manualMin = data.manualMin || '00';
          manualPeriod = data.manualPeriod || 'AM';

          // Update manual inputs
          document.getElementById('manualHour').value = manualHour;
          document.getElementById('manualMin').value = manualMin;
          document.getElementById('manualPeriod').value = manualPeriod;
          toggleTime(autoTime);
      }
  }

  // Update message reply display
  function updateUI() {
      const area = document.getElementById('messageArea');
      area.innerHTML = messages.map(msg => {
          const quotedMessage = messages.find(m => m.id === msg.replyTo);
          return `
          <div class="message ${msg.sender} ${selectedMessage === msg.id ? 'selected' : ''}" 
               id="msg-${msg.id}" ondblclick="selectMessage(${msg.id})">
              ${msg.replyTo ? `
                  <div class="quoted-message">
                      <div class="quoted-sender">
                          ${quotedMessage ? (quotedMessage.sender === 'user1' ? 'You' : 'User2') : 'Deleted message'}
                      </div>
                      ${quotedMessage ?
                      (quotedMessage.type === 'text' ? quotedMessage.content :
                          quotedMessage.type === 'image' ? '📷 Photo' :
                              quotedMessage.type === 'document' ? '📄 ' + quotedMessage.content.name : '')
                      : ''}
                  </div>
              ` : ''}
              ${msg.type === 'image' ?
                  `<img src="${msg.content}" class="image-message">` :
                  msg.type === 'document' ?
                      `<div class="document-message">
                      📄 ${msg.content.name}<br>
                      <small>${msg.content.size}</small>
                  </div>` :
                      msg.content}
              <span class="time-stamp">${msg.time}</span>
          </div>
          `;
      }).join('');

      document.getElementById('userName').textContent = currentUser;
      document.getElementById('lastSeen').textContent = lastSeenStatus;
  }