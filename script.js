// Initialize attendance data from localStorage
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];

// Set today's date as default
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    displayRecords();
    updateStatistics();
});

// Add new attendance record
function addAttendance() {
    const name = document.getElementById('name').value.trim();
    const date = document.getElementById('date').value;
    const status = document.getElementById('status').value;

    // Validation
    if (!name) {
        alert('请输入姓名！');
        return;
    }

    if (!date) {
        alert('请选择日期！');
        return;
    }

    // Create new record
    const record = {
        id: Date.now(),
        name: name,
        date: date,
        status: status,
        timestamp: new Date().toISOString()
    };

    // Add to data array
    attendanceData.unshift(record);

    // Save to localStorage
    saveData();

    // Clear form
    document.getElementById('name').value = '';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    document.getElementById('status').selectedIndex = 0;

    // Update display
    displayRecords();
    updateStatistics();

    // Show success message
    showMessage('记录添加成功！', 'success');
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

// Display all records
function displayRecords(filteredData = null) {
    const tableBody = document.getElementById('tableBody');
    const dataToDisplay = filteredData || attendanceData;

    if (dataToDisplay.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="no-data">暂无记录</td></tr>';
        return;
    }

    let html = '';
    dataToDisplay.forEach(record => {
        html += `
            <tr>
                <td>${record.date}</td>
                <td>${record.name}</td>
                <td class="status-${record.status}">${record.status}</td>
                <td>
                    <button class="delete-btn" onclick="deleteRecord(${record.id})">删除</button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

// Delete a record
function deleteRecord(id) {
    if (confirm('确定要删除这条记录吗？')) {
        attendanceData = attendanceData.filter(record => record.id !== id);
        saveData();
        displayRecords();
        updateStatistics();
        showMessage('记录已删除', 'info');
    }
}

// Update statistics
function updateStatistics() {
    const totalRecords = attendanceData.length;
    const presentCount = attendanceData.filter(r => r.status === '出勤').length;
    const absentCount = attendanceData.filter(r => r.status === '缺勤').length;
    const attendanceRate = totalRecords > 0 
        ? ((presentCount / totalRecords) * 100).toFixed(1) 
        : 0;

    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('presentCount').textContent = presentCount;
    document.getElementById('absentCount').textContent = absentCount;
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';
}

// Filter records
function filterRecords() {
    const searchName = document.getElementById('searchName').value.toLowerCase();
    const searchDate = document.getElementById('searchDate').value;
    const searchStatus = document.getElementById('searchStatus').value;

    let filtered = attendanceData;

    if (searchName) {
        filtered = filtered.filter(record => 
            record.name.toLowerCase().includes(searchName)
        );
    }

    if (searchDate) {
        filtered = filtered.filter(record => 
            record.date === searchDate
        );
    }

    if (searchStatus) {
        filtered = filtered.filter(record => 
            record.status === searchStatus
        );
    }

    displayRecords(filtered);
}

// Clear filters
function clearFilters() {
    document.getElementById('searchName').value = '';
    document.getElementById('searchDate').value = '';
    document.getElementById('searchStatus').selectedIndex = 0;
    displayRecords();
}

// Clear all data
function clearAllData() {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
        if (confirm('再次确认：真的要删除所有出勤记录吗？')) {
            attendanceData = [];
            saveData();
            displayRecords();
            updateStatistics();
            showMessage('所有数据已清空', 'warning');
        }
    }
}

// Show message (toast notification)
function showMessage(message, type) {
    const emoji = {
        'success': '✓',
        'info': 'ℹ',
        'warning': '⚠'
    };
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = `${emoji[type] || ''} ${message}`;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Export data to CSV (bonus feature)
function exportToCSV() {
    if (attendanceData.length === 0) {
        alert('没有数据可以导出');
        return;
    }

    let csv = '\uFEFF日期,姓名,状态,记录时间\n'; // \uFEFF is BOM for proper UTF-8 in Excel
    
    attendanceData.forEach(record => {
        csv += `${record.date},${record.name},${record.status},${record.timestamp}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to add record
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        addAttendance();
    }
});
