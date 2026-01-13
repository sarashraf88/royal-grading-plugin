jQuery(function ($) {

    $('#stu-class option:selected').data('grade')


    const root = $('#scgs-students-root');
    if (!root.length) return;

    console.log('Students module loaded');

    let editingStudentId = null;

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
<h3>Student Subject Groups</h3>

<p>
    <label><strong>Academic Year</strong></label><br>
    <select id="stu-subject-year">
        <option value="">Select Academic Year</option>
    </select>
</p>

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
    <div id="students-table"></div>
        
     
    `);
function loadAcademicYears() {
    $.post(royalPlugin.ajax_url, {
        action: 'scgs_get_academic_years',
        nonce: royalPlugin.nonce
    }, function (res) {

        if (!res || !res.success) return;

        let options = '<option value="">Select Academic Year</option>';

        res.data.forEach(y => {
            options += `<option value="${y.id}">${y.name}</option>`;
        });

        $('#stu-subject-year').html(options);
    });
}
  loadAcademicYears();

    
function loadSubjectGroupsForYear() {
    const yearId = $('#stu-subject-year').val();

    if (!yearId) {
        $('#stu-subject-groups').html('<p>Please select an academic year.</p>');
        return;
    }

    $.post(royalPlugin.ajax_url, {
        action: 'scgs_get_subject_groups',
        nonce: royalPlugin.nonce
    }, function (res) {

        if (!res || !res.success) {
            $('#stu-subject-groups').html('<p>Error loading subject groups.</p>');
            return;
        }

        let html = '';

        res.data.forEach(g => {
            html += `
                <label style="display:block;margin-bottom:6px">
                    <input type="checkbox"
                        class="stu-subject-group"
                        value="${g.id}">
                    ${g.name} (${g.grade_level})
                </label>
            `;
        });

        $('#stu-subject-groups').html(html);

        // Load existing selections if editing
        loadStudentSubjectGroups();
    });
}

$('#stu-subject-year').on('change', loadSubjectGroupsForYear);

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
