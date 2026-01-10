jQuery(function ($) {

    // ======================================================
    // STUDENTS MODULE
    // ======================================================

    const root = $('#scgs-students-root');

    if (!root.length) {
        return;
    }

    console.log('Students module loaded');

    let editingStudentId = null;

    // --------------------------------------------------
    // Render base UI
    // --------------------------------------------------
    root.html(`
        <h2>Add / Edit Student</h2>
        <p>
            <input type="text" id="stu-code" placeholder="Student Code" />
            <input type="text" id="stu-first" placeholder="First Name" />
            <input type="text" id="stu-last" placeholder="Last Name" />
            <select id="stu-class"></select>
            <button type="button" class="button button-primary" id="stu-save">
                Add
            </button>
            <button type="button" class="button" id="stu-cancel" style="display:none">
                Cancel
            </button>
        </p>
        <hr/>
        <div id="students-table"></div>
    `);

    // --------------------------------------------------
    // Load classes (dropdown)
    // --------------------------------------------------
    function loadClasses() {
        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_get_classes',
                nonce: royalPlugin.nonce
            },
            function (res) {
                if (!res || !res.success) {
                    $('#stu-class').html('<option value="">No classes found</option>');
                    return;
                }

                let options = '<option value="">Select Class</option>';
                res.data.forEach(c => {
                    options += `<option value="${c.id}">${c.name}</option>`;
                });

                $('#stu-class').html(options);
            }
        );
    }

    // --------------------------------------------------
    // Load students
    // --------------------------------------------------
    function loadStudents() {
        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_get_students',
                nonce: royalPlugin.nonce
            },
            function (res) {

                if (!res || !res.success) {
                    $('#students-table').html('<p>Error loading students</p>');
                    return;
                }

                let html = `
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                if (res.data.length === 0) {
                    html += `<tr><td colspan="5">No students found</td></tr>`;
                } else {
                    res.data.forEach(s => {
                        html += `
                            <tr>
                                <td>${s.id}</td>
                                <td>${s.student_code}</td>
                                <td>${s.first_name} ${s.last_name}</td>
                                <td>${s.class_name ?? '-'}</td>
                                <td>
                                    <button type="button"
                                        class="button stu-edit"
                                        data-id="${s.id}"
                                        data-code="${s.student_code}"
                                        data-first="${s.first_name}"
                                        data-last="${s.last_name}"
                                        data-class="${s.class_id}">
                                        Edit
                                    </button>
                                    <button type="button"
                                        class="button stu-delete"
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
            }
        );
    }

    // --------------------------------------------------
    // Initial load
    // --------------------------------------------------
    loadClasses();
    loadStudents();

    // --------------------------------------------------
    // Add / Update student
    // --------------------------------------------------
    $('#stu-save').on('click', function () {

        const actionName = editingStudentId
            ? 'scgs_update_student'
            : 'scgs_add_student';

        const payload = {
            action: actionName,
            nonce: royalPlugin.nonce,
            student_code: $('#stu-code').val(),
            first_name: $('#stu-first').val(),
            last_name: $('#stu-last').val(),
            class_id: $('#stu-class').val()
        };

        if (editingStudentId) {
            payload.id = editingStudentId;
        }

        $.post(
            royalPlugin.ajax_url,
            payload,
            function (res) {

                if (!res || !res.success) {
                    alert(res?.data?.message || 'Operation failed');
                    return;
                }

                resetForm();
                loadStudents();
            }
        );
    });

    // --------------------------------------------------
    // Edit student
    // --------------------------------------------------
    $(document).on('click', '.stu-edit', function () {

        editingStudentId = $(this).data('id');

        $('#stu-code').val($(this).data('code'));
        $('#stu-first').val($(this).data('first'));
        $('#stu-last').val($(this).data('last'));
        $('#stu-class').val($(this).data('class'));

        $('#stu-save').text('Update');
        $('#stu-cancel').show();
    });

    // --------------------------------------------------
    // Delete student
    // --------------------------------------------------
    $(document).on('click', '.stu-delete', function () {
        if (!confirm('Delete this student?')) return;

        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_delete_student',
                nonce: royalPlugin.nonce,
                id: $(this).data('id')
            },
            loadStudents
        );
    });

    // --------------------------------------------------
    // Cancel edit
    // --------------------------------------------------
    $('#stu-cancel').on('click', function () {
        resetForm();
    });

    // --------------------------------------------------
    // Reset form to Add mode
    // --------------------------------------------------
    function resetForm() {
        editingStudentId = null;
        $('#stu-code').val('');
        $('#stu-first').val('');
        $('#stu-last').val('');
        $('#stu-class').val('');
        $('#stu-save').text('Add');
        $('#stu-cancel').hide();
    }

});
