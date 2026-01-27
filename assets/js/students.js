jQuery(function ($) {

    $('#stu-class option:selected').data('grade')


    const root = $('#scgs-students-root');
    if (!root.length) return;

    console.log('Students module loaded');

    let editingStudentId = null;
    let allStudents = [];

    // --------------------------------------------------
    // Render UI
    // --------------------------------------------------
    root.html(`
        
        <p>
        <input type="file" id="stu-import-file" accept=".csv" />
        <button class="button" id="stu-import">Import CSV</button>
        <button class="button" id="stu-export">Export CSV</button>
    </p>

    <h2>Add Student</h2>

    <p>
        <input type="text" id="stu-code" placeholder="Student Code" />
        <input type="text" id="stu-first" placeholder="First Name" />
        <input type="text" id="stu-last" placeholder="Last Name" />
        <input type="text" id="stu-nationality" placeholder="Nationality" />
        <input type="date" id="stu-dob" />
        <input type="email" id="stu-email" placeholder="Student Email" />
        <select id="stu-class"></select>

        <button class="button button-primary" id="stu-add">
            Add
        </button>
    </p>

   <hr>
   <p>
    <label><strong>Academic Year:</strong></label>
    <select id="stu-subject-year"></select>
</p>

<h3>Student Subject Groups</h3>

<div id="stu-subject-groups">
    <p>Please select an academic year.</p>
</div>

<p>
    <button class="button button-primary" id="stu-save-subject-groups">
        Save Subject Groups
    </button>
</p>
    <div id="student-subject-groups-section"></div>

    <hr/>
    <input type="text"
               id="student-search"
               placeholder="Search students..."
               style="width:350px;margin-bottom:10px">
    
    <div id="students-table"></div>
        
     
    `);
// ======================================================


function loadAcademicYears() {

    $.post(royalPlugin.ajax_url, {
        action: 'scgs_get_academic_years',
        nonce: royalPlugin.nonce
    }, function (res) {

        if (!res || !res.success) return;

        let options = '';
        let activeYearId = null;

        res.data.forEach(y => {
            if (y.is_active == 1 && !activeYearId) {
                activeYearId = y.id;
            }

            options += `
                <option value="${y.id}">
                    ${y.name}${y.is_active == 1 ? ' (Active)' : ''}
                </option>
            `;
        });

        $('#stu-subject-year').html(options);

        // ✅ DEFAULT = ACTIVE YEAR
        if (activeYearId) {
            $('#stu-subject-year').val(activeYearId);
        }

        // Load data using default year
        loadStudents();
    });
}
loadAcademicYears();



    function loadSubjectsForGrade() {

    const selectedClass = $('#stu-class option:selected');
    const gradeLevel = selectedClass.data('grade');

    if (!gradeLevel) {
        $('#stu-subject-groups').html('<p>Please select a class.</p>');
        return;
    }

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_subjects_by_grade',
            nonce: royalPlugin.nonce,
            grade_level: gradeLevel
        }, function (res){

        if (!res || !res.success) {
            $('#stu-subject-groups').html('<p>Error loading subjects.</p>');
            return;
        }

        let html = '';
        let currentGroup = null;

        res.data.forEach(row => {

            if (currentGroup !== row.group_name) {
                currentGroup = row.group_name;
                html += `<h4 style="margin-top:12px">${currentGroup}</h4>`;
            }

            html += `
                <label style="display:block;margin-left:15px">
                    <input type="checkbox"
                        class="stu-subject"
                        data-group="${row.group_id}"
                        value="${row.subject_id}">
                    ${row.subject_name}
                </label>
            `;
        });

        $('#stu-subject-groups').html(html);

        // restore selections if editing
        //loadStudentSubjects();
    });
}



$('#stu-class').on('change', function () {
    loadSubjectsForGrade();
});


// ======================================================
// Load Student Subject Groups (EDIT MODE)
// ======================================================
function loadStudentSubjectGroups() {

    // Only run in edit mode
    if (!editingStudentId) return;

    const academicYearId = $('#stu-subject-year').val();
    if (!academicYearId) return;

    $.post(royalPlugin.ajax_url, {
        action: 'scgs_get_student_subject_groups',
        student_id: editingStudentId,
        academic_year_id: academicYearId
    }, function (res) {

        if (!res || !res.success) return;

        const selectedGroups = res.data.map(String);

        $('.stu-subject-group').each(function () {
            if (selectedGroups.includes($(this).val())) {
                $(this).prop('checked', true);
            }
        });
    });
}
$('#stu-subject-year').on('change', function () {
    loadStudentSubjectGroups();
});



    // --------------------------------------------------
    // Load Classes
    // --------------------------------------------------
    function loadClasses() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_classes',
            nonce: royalPlugin.nonce
        }, function (res) {

            if (!res || !res.success) {
                $('#stu-class').html('<option value="">No classes found</option>');
                return;
            }

            let options = '<option value="">Select Class</option>';
            res.data.forEach(c => {
                options += `
                    <option value="${c.id}" data-grade="${c.grade_level}">
                        ${c.name} (${c.grade_level})
                    </option>
                    `;

            });

            $('#stu-class').html(options);
        });
    }

    // --------------------------------------------------
    // Load Students
    // --------------------------------------------------
    function loadStudents() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_students',
            nonce: royalPlugin.nonce
        }, function (res) {

            if (!res || !res.success) {
                $('#students-table').html('<p>Error loading students</p>');
                return;
            }

            let html = `
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Nationality</th>
                            <th>Email</th>
                            <th>DOB</th>
                            <th>Class</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (res.data.length === 0) {
                html += `<tr><td colspan="7">No students found</td></tr>`;
            } else {
                res.data.forEach(s => {
                    html += `
                        <tr>
                            <td>${s.student_code}</td>
                            <td>${s.first_name} ${s.last_name}</td>
                            <td>${s.nationality ?? '-'}</td>
                            <td>${s.student_email ?? '-'}</td>
                            <td>${s.date_of_birth ?? '-'}</td>
                            <td>${s.class_name}</td>
                            <td>
                                <button
                                    class="button stu-edit"
                                    data-id="${s.id}"
                                    data-code="${s.student_code}"
                                    data-first="${s.first_name}"
                                    data-last="${s.last_name}"
                                    data-nationality="${s.nationality ?? ''}"
                                    data-email="${s.student_email ?? ''}"
                                    data-dob="${s.date_of_birth ?? ''}"
                                    data-class-id="${s.class_id}">
                                    Edit
                                </button>
                                <button
                                    class="button button-link-delete stu-delete"
                                    data-id="${s.id}">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            html += '</tbody></table>';
            $('#students-table').html(html);
        });
    }

    // --------------------------------------------------
    // Edit Student
    // --------------------------------------------------
    $(document).on('click', '.stu-edit', function () {

        editingStudentId = $(this).data('id');

        $('#stu-code').val($(this).data('code'));
        $('#stu-first').val($(this).data('first'));
        $('#stu-last').val($(this).data('last'));
        $('#stu-nationality').val($(this).data('nationality'));
        $('#stu-email').val($(this).data('email'));
        $('#stu-dob').val($(this).data('dob'));
        $('#stu-class').val($(this).data('classId'));

        $('#stu-add').text('Update');
    });

    // --------------------------------------------------
    // Add / Update Student
    // --------------------------------------------------
    $('#stu-add').on('click', function () {

        const actionName = editingStudentId
            ? 'scgs_update_student'
            : 'scgs_add_student';

        const payload = {
            action: actionName,
            nonce: royalPlugin.nonce,
            student_code: $('#stu-code').val(),
            first_name: $('#stu-first').val(),
            last_name: $('#stu-last').val(),
            nationality: $('#stu-nationality').val(),
            student_email: $('#stu-email').val(),
            date_of_birth: $('#stu-dob').val(),
            class_id: $('#stu-class').val()
        };

        if (editingStudentId) {
            payload.id = editingStudentId;
        }

        $.post(royalPlugin.ajax_url, payload, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Operation failed');
                return;
            }

            editingStudentId = null;
            $('#stu-code, #stu-first, #stu-last, #stu-nationality, #stu-email, #stu-dob').val('');
            $('#stu-class').val('');
            $('#stu-add').text('Add');

            loadStudents();
        });
    });

    // --------------------------------------------------
    // Delete Student
    // --------------------------------------------------
    $(document).on('click', '.stu-delete', function () {

        if (!confirm('Delete this student?')) return;

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_delete_student',
            nonce: royalPlugin.nonce,
            id: $(this).data('id')
        }, function () {
            loadStudents();
        });
    });

    
    // --------------------------------------------------
    // Search (SAFE)
    // --------------------------------------------------
    $('#student-search').on('keyup', function () {

        const q = $(this).val().toLowerCase();

        const filtered = allStudents.filter(s =>
            s.student_code.toLowerCase().includes(q) ||
            s.first_name.toLowerCase().includes(q) ||
            s.last_name.toLowerCase().includes(q) ||
            (s.nationality ?? '').toLowerCase().includes(q) ||
            (s.student_email ?? '').toLowerCase().includes(q) ||
            (s.class_name ?? '').toLowerCase().includes(q)
        );

        renderTable(filtered);
    });

    // --------------------------------------------------
    // Reset
    // --------------------------------------------------
    function resetForm() {
        editingId = null;
        $('#stu-code').val('');
        $('#stu-first').val('');
        $('#stu-last').val('');
        $('#stu-nationality').val('');
        $('#stu-dob').val('');
        $('#stu-email').val('');
        $('#stu-class').val('');
        $('#stu-save').text('Add');
    }

    // --------------------------------------------------
    // Init
    // --------------------------------------------------
    loadClasses();
    loadStudents();

    // --------------------------------------------------
// Export Students
// --------------------------------------------------
$('#stu-export').on('click', function () {
    window.location.href =
        royalPlugin.ajax_url +
        '?action=scgs_export_students&nonce=' +
        royalPlugin.nonce;
});

// --------------------------------------------------
// Import Students
// --------------------------------------------------
$('#stu-import').on('click', function () {

    const fileInput = $('#stu-import-file')[0];
    if (!fileInput.files.length) {
        alert('Please select a CSV file');
        return;
    }

    const formData = new FormData();
    formData.append('action', 'scgs_import_students');
    formData.append('nonce', royalPlugin.nonce);
    formData.append('file', fileInput.files[0]);

    $.ajax({
        url: royalPlugin.ajax_url,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (res) {
            if (!res || !res.success) {
                alert(res?.data?.message || 'Import failed');
                return;
            }

            alert(res.data.message);
            $('#stu-import-file').val('');
            loadStudents();
        }
    });
});


});
