const vscode = acquireVsCodeApi();

// Initial state
let currentPage = 1;
let currentLimit = 50;
let totalRows = 0;

window.addEventListener('message', event => {
    const message = event.data; 
    switch (message.type) {
        case 'update':
            console.log('Received data, rendering table...');
            currentPage = message.page || 1;
            currentLimit = message.limit || 50;
            totalRows = message.total || 0;
            renderTable(message.data);
            renderPagination();
            break;
        case 'error':
            showError(message.message);
            break;
    }
});

// Signal that the webview is ready to receive data
vscode.postMessage({ type: 'ready' });

console.log('Parquet Webview script loaded.');


function renderTable(data) {
    const tableContainer = document.getElementById('table-container');
    const loader = document.getElementById('loader');
    
    loader.style.display = 'none';
    tableContainer.innerHTML = '';

    if (!data || data.length === 0) {
        tableContainer.innerText = 'No data found in Parquet file.';
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Headers
    const headers = Object.keys(data[0]);
    const trHead = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.innerText = header;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            const value = row[header];
            // Basic formatting for objects/arrays if necessary
            td.innerText = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    tableContainer.appendChild(table);
}

function renderPagination() {
    let paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        document.body.appendChild(paginationContainer); // Append to body, sticky at bottom
    }
    
    paginationContainer.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Prev';
    prevBtn.disabled = currentPage <= 1;
    prevBtn.onclick = () => loadPage(currentPage - 1);
    
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next';
    // Disable if we likely reached the end (data length < limit, or we calculated total)
    // Note: If totalRows is accurate, we use that.
    const maxPage = Math.ceil(totalRows / currentLimit);
    nextBtn.disabled = currentPage >= maxPage;
    nextBtn.onclick = () => loadPage(currentPage + 1);

    const infoSpan = document.createElement('span');
    infoSpan.innerText = ` Page ${currentPage} of ${maxPage} (Total: ${totalRows}) `;

    const pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.min = 1;
    pageInput.max = maxPage;
    pageInput.value = currentPage;
    pageInput.style.width = '50px';
    pageInput.style.marginLeft = '10px';
    
    const goBtn = document.createElement('button');
    goBtn.innerText = 'Go';
    goBtn.onclick = () => {
        const page = parseInt(pageInput.value);
        if (page >= 1 && page <= maxPage) {
            loadPage(page);
        } else {
            alert(`Please enter a page number between 1 and ${maxPage}`);
        }
    };

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(infoSpan);
    paginationContainer.appendChild(nextBtn);
    
    // Jump controls
    const jumpContainer = document.createElement('span');
    jumpContainer.style.marginLeft = '20px';
    jumpContainer.innerText = 'Jump to: ';
    jumpContainer.appendChild(pageInput);
    jumpContainer.appendChild(goBtn);
    paginationContainer.appendChild(jumpContainer);
}

function loadPage(page) {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
    loader.innerText = `Loading page ${page}...`;
    
    // Clear error
    const errorDiv = document.getElementById('error');
    errorDiv.style.display = 'none';

    vscode.postMessage({ 
        type: 'loadPage',
        page: page,
        limit: currentLimit
    });
}

function showError(message) {
    const loader = document.getElementById('loader');
    const errorDiv = document.getElementById('error');
    
    loader.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.innerText = 'Error: ' + message;
}
