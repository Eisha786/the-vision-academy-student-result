const groupSelect = document.getElementById('groupSelect');
const examTypeSelect = document.getElementById('examTypeSelect');
const dynamicFields = document.getElementById('dynamicFields');

// Distinct subject groups with standard test-session default max marks
const groupSubjectsMap = {
  'science-bio': {
    label: 'Science (Biology Group)',
    subjects: [
      { id: 'english', name: 'English', boardMax: 75 },
      { id: 'urdu', name: 'Urdu', boardMax: 75 },
      { id: 'islamiyat', name: 'Islamiyat', boardMax: 50 },
      { id: 'quran', name: 'Quran / Tarjuma-tul-Quran', boardMax: 50 },
      { id: 'math', name: 'Mathematics', boardMax: 75 },
      { id: 'physics', name: 'Physics', boardMax: 60 },
      { id: 'chemistry', name: 'Chemistry', boardMax: 60 },
      { id: 'bio', name: 'Biology', boardMax: 60 }
    ]
  },
  'science-cs': {
    label: 'Science (Computer Science Group)',
    subjects: [
      { id: 'english', name: 'English', boardMax: 75 },
      { id: 'urdu', name: 'Urdu', boardMax: 75 },
      { id: 'islamiyat', name: 'Islamiyat', boardMax: 50 },
      { id: 'quran', name: 'Quran / Tarjuma-tul-Quran', boardMax: 50 },
      { id: 'math', name: 'Mathematics', boardMax: 75 },
      { id: 'physics', name: 'Physics', boardMax: 60 },
      { id: 'chemistry', name: 'Chemistry', boardMax: 60 },
      { id: 'computer', name: 'Computer Science', boardMax: 50 }
    ]
  },
  'arts': {
    label: 'Arts / Humanities Group',
    subjects: [
      { id: 'english', name: 'English', boardMax: 75 },
      { id: 'urdu', name: 'Urdu', boardMax: 75 },
      { id: 'islamiyat', name: 'Islamiyat', boardMax: 50 },
      { id: 'quran', name: 'Quran / Tarjuma-tul-Quran', boardMax: 50 },
      { id: 'genMath', name: 'General Mathematics', boardMax: 75 },
      { id: 'genScience', name: 'General Science', boardMax: 75 },
      { id: 'artsElective1', name: 'Arts Elective 1', boardMax: 75 },
      { id: 'artsElective2', name: 'Arts Elective 2', boardMax: 75 }
    ]
  }
};

// Switch Pages & Save Current Page to LocalStorage
function goToPage(pageNumber) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(`page${pageNumber}`).classList.add('active');
  localStorage.setItem('currentPage', pageNumber);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render dynamic fields based on group and assessment choice
function renderFields() {
  const selectedGroup = groupSelect.value;
  const isMonthly = examTypeSelect.value === 'monthly';
  const groupData = groupSubjectsMap[selectedGroup];

  let html = '';
  groupData.subjects.forEach(sub => {
    const defaultMax = isMonthly ? 30 : sub.boardMax;

    html += `
      <div class="subject-block">
        <h4>${sub.name}</h4>
        <div class="dual-inputs">
          <div class="form-group">
            <label for="max_${sub.id}">Max Marks Choice</label>
            <input type="number" id="max_${sub.id}" value="${defaultMax}" min="1" required>
          </div>
          <div class="form-group">
            <label for="score_${sub.id}">Obtained Marks</label>
            <input type="number" id="score_${sub.id}" placeholder="0" min="0" required>
          </div>
        </div>
      </div>
    `;
  });

  dynamicFields.innerHTML = html;
}

// Event Listeners for renders
groupSelect.addEventListener('change', renderFields);
examTypeSelect.addEventListener('change', renderFields);

// Process Result Card Output
document.getElementById('resultForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('studentName').value;
  const selectedGroup = groupSelect.value;
  const examTypeLabel = examTypeSelect.options[examTypeSelect.selectedIndex].text;
  const groupData = groupSubjectsMap[selectedGroup];

  const tableBody = document.getElementById('resTableBody');
  tableBody.innerHTML = '';

  let totalObtained = 0;
  let totalMax = 0;
  let overallPass = true;

  groupData.subjects.forEach(sub => {
    const customMax = parseFloat(document.getElementById(`max_${sub.id}`).value) || 30;
    const score = parseFloat(document.getElementById(`score_${sub.id}`).value) || 0;

    const passThreshold = customMax * 0.33; // 33% passing rule
    const isSubjectPass = score >= passThreshold;

    if (!isSubjectPass) overallPass = false;

    totalObtained += score;
    totalMax += customMax;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sub.name}</td>
      <td>${customMax}</td>
      <td>${score}</td>
      <td class="${isSubjectPass ? 'status-pass' : 'status-fail'}">${isSubjectPass ? 'Pass' : 'Fail'}</td>
    `;
    tableBody.appendChild(row);
  });

  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  // Grade Determination
  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 33) grade = 'D';

  // Populate Page 3
  document.getElementById('resName').textContent = name;
  document.getElementById('resGroup').textContent = groupData.label;
  document.getElementById('resExamType').textContent = examTypeLabel;
  document.getElementById('resTotal').textContent = `${totalObtained} / ${totalMax}`;
  document.getElementById('resPercentage').textContent = `${percentage.toFixed(1)}%`;
  document.getElementById('resGrade').textContent = grade;

  const resStatusEl = document.getElementById('resStatus');
  if (overallPass && percentage >= 33) {
    resStatusEl.textContent = 'PASSED';
    resStatusEl.className = 'status-pass';
  } else {
    resStatusEl.textContent = 'FAILED';
    resStatusEl.className = 'status-fail';
  }

  // Go to Page 3
  goToPage(3);
});

// On Page Load: Restore Saved Page State
window.addEventListener('DOMContentLoaded', () => {
  renderFields();
  const savedPage = localStorage.getItem('currentPage') || 1;
  goToPage(parseInt(savedPage));
});