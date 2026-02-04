jQuery(function ($) {

    const root = $('#scgs-students-root');
    if (!root.length) return;

    const Students = {

        state: {
            students: [],
            editingId: null
        },

        init() {
            this.renderLayout();
            this.bindEvents();
            this.loadClasses();
            this.loadStudents();
        },

        // --------------------------------------------------
        // UI
        // --------------------------------------------------
        renderLayout() {
            root.html(`
                <p>
                    <input type="file" id="stu-import-file" accept=".csv" />
                    <button class="button" id="stu-import">Import CSV</button>
                    <button class="button" id="stu-export">Export All</button>
                    <button class="button" id="stu-export-selected">Export Selected</button>
                </p>

                <h2>Add / Edit Student</h2>

                <p>
                    <input type="text" id="stu-code" placeholder="Student Code" />
                    <input type="text" id="stu-first" placeholder="First Name" />
                    <input type="text" id="stu-last" placeholder="Last Name" />
                    <input type="text" id="stu-nationality" placeholder="Nationality" />
                    <input type="date" id="stu-dob" />
                    <input type="email" id="stu-email" placeholder="Student Email" />
                    <select id="stu-class"></select>
                    <button class="button button-primary" id="stu-save">Add</button>
                </p>

                <hr>

                <button class="button button-secondary" id="stu-bulk-delete">
                    Delete Selected
                </button>

                <button class="button" id="stu-assign-group">
                    Assign Subject Group
                </button>

                <input
                    type="text"
                    id="student-search"
                    placeholder="Search students..."
                    style="width:350px;margin-left:10px"
                >

                <div id="stu-subject-groups" style="margin-top:10px"></div>



                <div id="students-table" style="margin-top:10px"></div>


            `);
        },

        // --------------------------------------------------
        // Data Loaders
        // --------------------------------------------------
        loadClasses() {
            $.post(royalPlugin.ajax_url, {
                action: 'scgs_get_classes',
                nonce: royalPlugin.nonce
            }, res => {

                let options = '<option value="">Select Class</option>';
                if (res?.success) {
                    res.data.forEach(c => {
                        options += `<option value="${c.id}">${c.name}</option>`;
                    });
                }
                $('#stu-class').html(options);
            });
        },

        loadSubjectGroupsForClass(classId) {

                if (!classId) {
                    $('#stu-subject-groups').html('');
                    return;
                }

                // Find grade from selected class
                const selectedClass = $('#stu-class option:selected');
                const gradeId = selectedClass.data('grade');

                if (!gradeId) return;

                $.post(royalPlugin.ajax_url, {
                    action: 'scgs_get_subject_groups_by_grade',
                    nonce: royalPlugin.nonce,
                    grade_id: gradeId
                }, res => {

                    if (!res?.success || !res.data.length) {
                        $('#stu-subject-groups').html('<em>No subject groups</em>');
                        return;
                    }

                    let html = '<strong>Subject Group:</strong><br>';

                    res.data.forEach(g => {
                        html += `
                            <label style="display:block;margin-left:10px">
                                <input type="radio" name="stu_subject_group" value="${g.id}">
                                ${g.name}
                            </label>
                        `;
                    });

                    $('#stu-subject-groups').html(html);
                            });
                        },


        loadStudents() {
            $.post(royalPlugin.ajax_url, {
                action: 'scgs_get_students',
                nonce: royalPlugin.nonce
            }, res => {

                if (!res?.success) {
                    $('#students-table').html('<p>Error loading students</p>');
                    return;
                }

                this.state.students = res.data;
                this.renderTable(res.data);
            });
        },

        

        // --------------------------------------------------
        // Table
        // --------------------------------------------------
        renderTable(data) {

            let html = `
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="stu-select-all"></th>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Class</th>
                            <th>Date of birth</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (!data.length) {
                html += `<tr><td colspan="6">No students found</td></tr>`;
            } else {
                data.forEach(s => {
                    html += `
                        <tr>
                            <td><input type="checkbox" class="stu-select" value="${s.id}"></td>
                            <td>${s.student_code}</td>
                            <td>${s.first_name} ${s.last_name}</td>
                            <td>${s.student_email || '-'}</td>
                            <td>${s.class_name}</td>
                            <td>${s.date_of_birth}</td>
                            <td>
                                <button
                                    class="button stu-edit"
                                    data-id="${s.id}"
                                    data-code="${s.student_code}"
                                    data-first="${s.first_name}"
                                    data-last="${s.last_name}"
                                    data-nationality="${s.nationality || ''}"
                                    data-email="${s.student_email || ''}"
                                    data-dob="${s.date_of_birth || ''}"
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
        },

        // --------------------------------------------------
        // Helpers
        // --------------------------------------------------
        getSelectedIds() {
            return $('.stu-select:checked').map(function () {
                return $(this).val();
            }).get();
        },

        // --------------------------------------------------
        // Events
        // --------------------------------------------------
        bindEvents() {

            $('#stu-class').on('change', e => {
                this.loadSubjectGroupsForClass(e.target.value);
            });


            // Select all
            $(document).on('change', '#stu-select-all', function () {
                $('.stu-select').prop('checked', this.checked);
            });

            // Search
            $('#student-search').on('keyup', e => {
                const q = e.target.value.toLowerCase();
                const filtered = this.state.students.filter(s =>
                    s.student_code.toLowerCase().includes(q) ||
                    s.first_name.toLowerCase().includes(q) ||
                    s.last_name.toLowerCase().includes(q) ||
                    (s.student_email || '').toLowerCase().includes(q)
                );
                this.renderTable(filtered);
            });

            // Save
            $('#stu-save').on('click', () => this.saveStudent());

            // Edit
            $(document).on('click', '.stu-edit', e => this.populateForm($(e.currentTarget)));

            // Delete single
            $(document).on('click', '.stu-delete', e =>
                this.deleteStudent($(e.currentTarget).data('id'))
            );

            // Bulk delete
            $('#stu-bulk-delete').on('click', () => this.bulkDelete());

            // Export
            $('#stu-export').on('click', () => {
                window.location.href =
                    royalPlugin.ajax_url +
                    '?action=scgs_export_students&nonce=' +
                    royalPlugin.nonce;
            });

            // Export selected
            $('#stu-export-selected').on('click', () => this.exportSelected());

            // Import
            $('#stu-import').on('click', () => this.importCSV());

            // Assign subject group
            $('#stu-assign-group').on('click', () => this.assignGroup());
        },

        // --------------------------------------------------
        // Actions
        // --------------------------------------------------
        populateForm(btn) {
            this.state.editingId = btn.data('id');
            $('#stu-code').val(btn.data('code'));
            $('#stu-first').val(btn.data('first'));
            $('#stu-last').val(btn.data('last'));
            $('#stu-nationality').val(btn.data('nationality'));
            $('#stu-email').val(btn.data('email'));
            $('#stu-dob').val(btn.data('dob'));
            $('#stu-class').val(btn.data('class-id'));
            $('#stu-save').text('Update');
        },

                saveStudent() {
            $.post(royalPlugin.ajax_url, {
                action: this.state.editingId ? 'scgs_update_student' : 'scgs_add_student',
                nonce: royalPlugin.nonce,
                id: this.state.editingId,
                student_code: $('#stu-code').val(),
                first_name: $('#stu-first').val(),
                last_name: $('#stu-last').val(),
                nationality: $('#stu-nationality').val(),
                student_email: $('#stu-email').val(),
                date_of_birth: $('#stu-dob').val(),
                class_id: $('#stu-class').val()
            }, res => {
                if (!res?.success) {
                    alert(res?.data?.message || 'Save failed');
                    return;
                }
                this.resetForm();
                this.loadStudents();
            });
        }
,

        deleteStudent(id) {
            if (!confirm('Delete this student?')) return;

            $.post(royalPlugin.ajax_url, {
                action: 'scgs_delete_student',
                nonce: royalPlugin.nonce,
                id
            }, () => this.loadStudents());
        },

        bulkDelete() {
            const ids = this.getSelectedIds();
            if (!ids.length) return alert('No students selected');

            if (!confirm(`Delete ${ids.length} students?`)) return;

            $.post(royalPlugin.ajax_url, {
                action: 'scgs_bulk_delete_students',
                nonce: royalPlugin.nonce,
                ids
            }, res => {
                if (!res?.success) {
                    alert(res?.data?.message || 'Bulk delete failed');
                    return;
                }
                this.loadStudents();
            });
        },

        exportSelected() {
            const ids = this.getSelectedIds();
            if (!ids.length) return alert('No students selected');

            window.location.href =
                royalPlugin.ajax_url +
                '?action=scgs_export_students&ids=' +
                ids.join(',') +
                '&nonce=' +
                royalPlugin.nonce;
        },

        assignGroup() {
            const ids = this.getSelectedIds();
            if (!ids.length) return alert('No students selected');

            const groupId = prompt('Enter Subject Group ID:');
            if (!groupId) return;

            $.post(royalPlugin.ajax_url, {
                action: 'scgs_assign_students_group',
                nonce: royalPlugin.nonce,
                ids,
                group_id: groupId
            }, res => {
                if (!res?.success) {
                    alert(res?.data?.message || 'Assignment failed');
                    return;
                }
                alert('Students assigned');
            });
        },

        importCSV() {
            const file = $('#stu-import-file')[0].files[0];
            if (!file) return alert('Select a CSV file');

            const fd = new FormData();
            fd.append('action', 'scgs_import_students');
            fd.append('nonce', royalPlugin.nonce);
            fd.append('file', file);

            $.ajax({
                url: royalPlugin.ajax_url,
                type: 'POST',
                data: fd,
                processData: false,
                contentType: false,
                success: res => {
                    if (!res?.success) {
                        alert(res?.data?.message || 'Import failed');
                        return;
                    }
                    alert(res.data.message);
                    $('#stu-import-file').val('');
                    this.loadStudents();
                }
            });
        },

        resetForm() {
            this.state.editingId = null;
            $('#stu-code, #stu-first, #stu-last, #stu-nationality, #stu-email, #stu-dob').val('');
            $('#stu-class').val('');
            $('#stu-save').text('Add');
        }
    };

    Students.init();
});
