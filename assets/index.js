console.log('SCGS index.js loaded');

jQuery(document).ready(function ($) {
     
    /**
     * ======================================================
     * SUBJECT GROUPS PAGE
     * ======================================================
     */
    if ($('#scgs-subject-groups-root').length) {
        let editingGroupId = null;
          console.log('SUBJECT GROUP PAGE DETECTED');

        const root = $('#scgs-subject-groups-root');

        root.html(`
            <h2>Add Subject Group</h2>
            <p>
                <input type="text" id="sg-name" placeholder="Group Name" />
                <input type="text" id="sg-grade" placeholder="Grade Level" />
                <label style="margin-left:10px">
                    <input type="checkbox" id="sg-required" /> Required
                </label>
                <button type="button" class="button button-primary" id="sg-add">Add</button>
            </p>
            <hr/>
            <div id="sg-table"></div>
        `);

        function loadSubjectGroups() {
            $.post(SCGS_DATA.ajax_url, {
                action: 'scgs_get_subject_groups',
                nonce: SCGS_DATA.nonce
            }, function (res) {

                if (!res || !res.success) {
                    $('#sg-table').html('<p>Error loading subject groups</p>');
                    return;
                }

                let html = `
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Grade</th>
                                <th>Required</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                if (res.data.length === 0) {
                    html += `<tr><td colspan="5">No subject groups found</td></tr>`;
                } else {
                    res.data.forEach(g => {
                        html += `
                            <tr>
                                <td>${g.id}</td>
                                <td>${g.name}</td>
                                <td>${g.grade_level}</td>
                                <td>${g.is_required == 1 ? 'Yes' : 'No'}</td>
                                <td>
                                    <button type="button"
                                        class="button sg-edit"
                                        data-id="${g.id}"
                                        data-name="${g.name}"
                                        data-grade="${g.grade_level}"
                                        data-required="${g.is_required}">
                                        Edit
                                    </button>
                                    <button type="button"
                                        class="button sg-delete"
                                        data-id="${g.id}">
                                        Delete
                                    </button>
                                </td>

                            </tr>
                        `;
                    });
                }

                html += '</tbody></table>';
                $('#sg-table').html(html);
            });
        }

        loadSubjectGroups();

                    $('#sg-add').off('click').on('click', function () {

                        console.log('Editing ID:', editingGroupId);

                        const isEdit = editingGroupId !== null;

                        const payload = {
                            action: isEdit
                                ? 'scgs_update_subject_group'
                                : 'scgs_add_subject_group',
                            nonce: SCGS_DATA.nonce,
                            name: $('#sg-name').val(),
                            grade_level: $('#sg-grade').val(),
                            is_required: $('#sg-required').is(':checked') ? 1 : 0
                        };

                        if (isEdit) {
                            payload.id = editingGroupId;
                        }

                        $.post(SCGS_DATA.ajax_url, payload, function (res) {

                            if (!res || !res.success) {
                                alert(res?.data?.message || 'Operation failed');
                                return;
                            }

                            // RESET EDIT STATE
                            editingGroupId = null;
                            $('#sg-add').text('Add');
                            $('#sg-name').val('');
                            $('#sg-grade').val('');
                            $('#sg-required').prop('checked', false);

                            loadSubjectGroups();
                        });
                    });


        $(document).on('click', '.sg-delete', function () {
            if (!confirm('Delete this subject group?')) return;

            $.post(SCGS_DATA.ajax_url, {
                action: 'scgs_delete_subject_group',
                nonce: SCGS_DATA.nonce,
                id: $(this).data('id')
            }, loadSubjectGroups);
        });



        $(document).on('click', '.sg-edit', function () {

                // store editing ID
                editingGroupId = $(this).data('id');

                // fill the form
                $('#sg-name').val($(this).data('name'));
                $('#sg-grade').val($(this).data('grade'));
                $('#sg-required').prop(
                    'checked',
                    $(this).data('required') == 1
                );

                // change button text
                $('#sg-add').text('Update');
            });

    }

/**
 * ======================================================
 * STUDENTS PAGE (EXTENDED)
 * ======================================================
 */
if ($('#scgs-students-root').length) {

    let editingStudentId = null;
    let parentEmails = [];

    const root = $('#scgs-students-root');

    root.html(`
        <h2>Add / Edit Student</h2>

        <p>
            <input type="text" id="st-code" placeholder="Student Code" />
            <input type="text" id="st-first" placeholder="First Name" />
            <input type="text" id="st-last" placeholder="Last Name" />
            <input type="text" id="st-nationality" placeholder="Nationality" />
        </p>

        <p>
            <input type="date" id="st-dob" />
            <input type="email" id="st-email" placeholder="Student Email" />
            <select id="st-class"></select>
        </p>

        <h4>Parent Emails</h4>
        <p>
            <input type="email" id="parent-email-input" placeholder="Parent Email" />
            <button class="button" id="add-parent-email">Add</button>
        </p>
        <ul id="parent-email-list"></ul>

        <p>
            <button class="button button-primary" id="st-save">Save</button>
        </p>

        <hr/>
        <div id="students-table"></div>
    `);

    function renderParentEmails() {
        const list = $('#parent-email-list');
        list.empty();
        parentEmails.forEach((email, index) => {
            list.append(`
                <li>
                    ${email}
                    <button class="button link-delete remove-parent" data-index="${index}">×</button>
                </li>
            `);
        });
    }

    $('#add-parent-email').on('click', function (e) {
        e.preventDefault();
        const email = $('#parent-email-input').val().trim();
        if (email && !parentEmails.includes(email)) {
            parentEmails.push(email);
            $('#parent-email-input').val('');
            renderParentEmails();
        }
    });

    $(document).on('click', '.remove-parent', function () {
        parentEmails.splice($(this).data('index'), 1);
        renderParentEmails();
    });

    function loadClasses() {
        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_get_classes',
            nonce: SCGS_DATA.nonce
        }, function (res) {
            if (!res || !res.success) return;

            let opts = '<option value="">Select Class</option>';
            res.data.forEach(c => {
                opts += `<option value="${c.id}">${c.name}</option>`;
            });
            $('#st-class').html(opts);
        });
    }

    function loadStudents() {
        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_get_students',
            nonce: SCGS_DATA.nonce
        }, function (res) {

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
                                <button class="button stu-edit" data-id="${s.id}">Edit</button>
                                <button class="button stu-delete" data-id="${s.id}">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }

            html += '</tbody></table>';
            $('#students-table').html(html);
        });
    }

    loadClasses();
    loadStudents();

    $('#st-save').on('click', function () {

        const payload = {
            action: 'scgs_save_student',
            nonce: SCGS_DATA.nonce,
            id: editingStudentId,
            student_code: $('#st-code').val(),
            first_name: $('#st-first').val(),
            last_name: $('#st-last').val(),
            nationality: $('#st-nationality').val(),
            date_of_birth: $('#st-dob').val(),
            student_email: $('#st-email').val(),
            class_id: $('#st-class').val(),
            parent_emails: parentEmails
        };

        $.post(SCGS_DATA.ajax_url, payload, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Save failed');
                return;
            }

            editingStudentId = null;
            parentEmails = [];
            $('input').val('');
            $('#parent-email-list').empty();

            loadStudents();
        });
    });

    $(document).on('click', '.stu-edit', function () {

        const id = $(this).data('id');

        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_get_student',
            nonce: SCGS_DATA.nonce,
            id: id
        }, function (res) {

            if (!res || !res.success) return;

            const s = res.data;

            editingStudentId = s.id;
            parentEmails = s.parent_emails || [];

            $('#st-code').val(s.student_code);
            $('#st-first').val(s.first_name);
            $('#st-last').val(s.last_name);
            $('#st-nationality').val(s.nationality);
            $('#st-dob').val(s.date_of_birth);
            $('#st-email').val(s.student_email);
            $('#st-class').val(s.class_id);

            renderParentEmails();
        });
    });

    $(document).on('click', '.stu-delete', function () {
        if (!confirm('Delete this student?')) return;

        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_delete_student',
            nonce: SCGS_DATA.nonce,
            id: $(this).data('id')
        }, loadStudents);
    });
}



/**
 * ======================================================
 * SUBJECT CRITERIA PAGE
 * ======================================================
 */
if ($('#scgs-subject-criteria-root').length) {

    let editingId = null;
    const root = $('#scgs-subject-criteria-root');

    root.html(`
        <p>
            <select id="crit-subject"></select>
            <input type="text" id="crit-grade" placeholder="Grade (e.g. Grade 5)" />
            <label><input type="checkbox" id="crit-assess" checked /> Has Assessment</label>
        </p>
        <p>
            <input type="number" id="crit-weekly" placeholder="Weekly %" />
            <input type="number" id="crit-assessment" placeholder="Assessment %" />
            <input type="number" id="crit-final" placeholder="Final %" />
            <select id="crit-credit">
                <option value="credit">Credit</option>
                <option value="non-credit">Non-Credit</option>
            </select>
            <button class="button button-primary" id="crit-save">Save</button>
        </p>
        <hr/>
        <div id="criteria-table"></div>
    `);

    function loadSubjects() {
        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_get_subjects',
            nonce: SCGS_DATA.nonce
        }, res => {
            if (!res || !res.success) return;
            let opt = '<option value="">Select Subject</option>';
            res.data.forEach(s => opt += `<option value="${s.id}">${s.name}</option>`);
            $('#crit-subject').html(opt);
        });
    }

    function loadCriteria() {
        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_get_subject_criteria',
            nonce: SCGS_DATA.nonce
        }, res => {
            if (!res || !res.success) {
                $('#criteria-table').html('<p>No criteria found</p>');
                return;
            }

            let html = `
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Grade</th>
                            <th>Weekly</th>
                            <th>Assessment</th>
                            <th>Final</th>
                            <th>Credit</th>
                            <th>Action</th>
                        </tr>
                    </thead><tbody>
            `;

            res.data.forEach(r => {
                html += `
                    <tr>
                        <td>${r.subject_name}</td>
                        <td>${r.grade_level}</td>
                        <td>${r.weekly_weight}%</td>
                        <td>${r.assessment_weight}%</td>
                        <td>${r.final_weight}%</td>
                        <td>${r.credit_type}</td>
                        <td>
                            <button class="button crit-edit"
                                data-id="${r.id}"
                                data-subject="${r.subject_id}"
                                data-grade="${r.grade_level}"
                                data-weekly="${r.weekly_weight}"
                                data-assessment="${r.assessment_weight}"
                                data-final="${r.final_weight}"
                                data-credit="${r.credit_type}"
                                data-has="${r.has_assessment}">
                                Edit
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            $('#criteria-table').html(html);
        });
    }

    loadSubjects();
    loadCriteria();

    $('#crit-save').on('click', function () {
        const payload = {
            action: 'scgs_save_subject_criteria',
            nonce: SCGS_DATA.nonce,
            id: editingId,
            subject_id: $('#crit-subject').val(),
            grade_level: $('#crit-grade').val(),
            weekly_weight: $('#crit-weekly').val(),
            assessment_weight: $('#crit-assessment').val(),
            final_weight: $('#crit-final').val(),
            credit_type: $('#crit-credit').val(),
            has_assessment: $('#crit-assess').is(':checked') ? 1 : 0
        };

        $.post(SCGS_DATA.ajax_url, payload, res => {
            if (!res || !res.success) {
                alert(res?.data?.message || 'Save failed');
                return;
            }
            editingId = null;
            loadCriteria();
        });
    });

    $(document).on('click', '.crit-edit', function () {
        editingId = $(this).data('id');
        $('#crit-subject').val($(this).data('subject'));
        $('#crit-grade').val($(this).data('grade'));
        $('#crit-weekly').val($(this).data('weekly'));
        $('#crit-assessment').val($(this).data('assessment'));
        $('#crit-final').val($(this).data('final'));
        $('#crit-credit').val($(this).data('credit'));
        $('#crit-assess').prop('checked', $(this).data('has') == 1);
    });
}



    /**
 * ======================================================
 * ACADEMIC YEARS PAGE (CRUD)
 * ======================================================
 */
if ($('#scgs-academic-years-root').length) {

    console.log('Academic Years page detected');

    const root = $('#scgs-academic-years-root');

    root.html(`
        <p>
            <input type="text" id="ay-name" placeholder="Academic Year (e.g. 2024–2025)" />
            <button class="button button-primary" id="ay-add">Add</button>
        </p>
        <hr/>
        <div id="ay-table"></div>
    `);

    function loadYears() {
        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_get_academic_years',
            nonce: SCGS_DATA.nonce
        }, function (res) {

            if (!res || !res.success) {
                $('#ay-table').html('<p>Error loading academic years</p>');
                return;
            }

            let html = `
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (res.data.length === 0) {
                html += `<tr><td colspan="3">No academic years found</td></tr>`;
            } else {
                res.data.forEach(y => {
                    html += `
                        <tr>
                            <td>${y.name}</td>
                            <td>${y.is_active == 1 ? 'Active' : ''}</td>
                            <td>
                                ${y.is_active == 0
                                    ? `<button class="button ay-activate" data-id="${y.id}">Set Active</button>`
                                    : ''}
                            </td>
                        </tr>
                    `;
                });
            }

            html += '</tbody></table>';
            $('#ay-table').html(html);
        });
    }

    loadYears();

    $('#ay-add').on('click', function () {

        const name = $('#ay-name').val().trim();
        if (!name) {
            alert('Please enter academic year name');
            return;
        }

        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_add_academic_year',
            nonce: SCGS_DATA.nonce,
            name: name
        }, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Failed to add academic year');
                return;
            }

            $('#ay-name').val('');
            loadYears();
        });
    });

    $(document).on('click', '.ay-activate', function () {

        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_set_active_academic_year',
            nonce: SCGS_DATA.nonce,
            id: $(this).data('id')
        }, function () {
            loadYears();
        });
    });
}

});
