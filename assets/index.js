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
     * STUDENTS PAGE (ADD + EDIT + DELETE)
     * ======================================================
     */
    if ($('#scgs-students-root').length) {

        let editingStudentId = null;

        const root = $('#scgs-students-root');

        root.html(`
            <h2>Add / Edit Student</h2>
            <p>
                <input type="text" id="stu-code" placeholder="Student Code" />
                <input type="text" id="stu-first" placeholder="First Name" />
                <input type="text" id="stu-last" placeholder="Last Name" />
                <select id="stu-class"></select>
                <button type="button" class="button button-primary" id="stu-save">Add</button>
            </p>
            <hr/>
            <div id="students-table"></div>
        `);

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
                $('#stu-class').html(opts);
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
            });
        }

        loadClasses();
        loadStudents();

        $('#stu-save').on('click', function () {

            const actionName = editingStudentId
                ? 'scgs_update_student'
                : 'scgs_add_student';

            const payload = {
                action: actionName,
                nonce: SCGS_DATA.nonce,
                student_code: $('#stu-code').val(),
                first_name: $('#stu-first').val(),
                last_name: $('#stu-last').val(),
                class_id: $('#stu-class').val()
            };

            if (editingStudentId) {
                payload.id = editingStudentId;
            }

            $.post(SCGS_DATA.ajax_url, payload, function (res) {
                if (!res || !res.success) {
                    alert(res?.data?.message || 'Operation failed');
                    return;
                }

                editingStudentId = null;
                $('#stu-save').text('Add');
                $('#stu-code').val('');
                $('#stu-first').val('');
                $('#stu-last').val('');
                loadStudents();
            });
        });

        $(document).on('click', '.stu-edit', function () {
            editingStudentId = $(this).data('id');

            $('#stu-code').val($(this).data('code'));
            $('#stu-first').val($(this).data('first'));
            $('#stu-last').val($(this).data('last'));
            $('#stu-class').val($(this).data('class'));

            $('#stu-save').text('Update');
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
 * SUBJECTS PAGE
 * ======================================================
 */
/**
 * ======================================================
 * SUBJECTS PAGE (CRUD)
 * ======================================================
 */
if ($('#scgs-subjects-root').length) {

    let editingSubjectId = null;

    const root = $('#scgs-subjects-root');

    root.html(`
        <h2>Add / Edit Subject</h2>
        <p>
            <input type="text" id="sub-name" placeholder="Subject Name" />
            <input type="number" id="sub-score" placeholder="Max Score" />
            <select id="sub-group"></select>
            <button type="button" class="button button-primary" id="sub-save">
                Add
            </button>
        </p>
        <hr/>
        <div id="subjects-table"></div>
    `);

    function loadGroups() {
        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_get_subject_groups',
            nonce: SCGS_DATA.nonce
        }, function (res) {
            if (!res || !res.success) return;

            let options = '<option value="">Select Group</option>';
            res.data.forEach(g => {
                options += `<option value="${g.id}">${g.name}</option>`;
            });

            $('#sub-group').html(options);
        });
    }

    function loadSubjects() {
        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_get_subjects',
            nonce: SCGS_DATA.nonce
        }, function (res) {

            if (!res || !res.success) {
                $('#subjects-table').html('<p>Error loading subjects</p>');
                return;
            }

            let html = `
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Max Score</th>
                            <th>Group</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (res.data.length === 0) {
                html += `<tr><td colspan="5">No subjects found</td></tr>`;
            } else {
                res.data.forEach(s => {
                    html += `
                        <tr>
                            <td>${s.id}</td>
                            <td>${s.name}</td>
                            <td>${s.max_score}</td>
                            <td>${s.group_name ?? '-'}</td>
                            <td>
                                <button class="button sub-edit"
                                    data-id="${s.id}"
                                    data-name="${s.name}"
                                    data-score="${s.max_score}"
                                    data-group="${s.subject_group_id}">
                                    Edit
                                </button>
                                <button class="button sub-delete"
                                    data-id="${s.id}">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            html += '</tbody></table>';
            $('#subjects-table').html(html);
        });
    }

    loadGroups();
    loadSubjects();

    $('#sub-save').on('click', function () {

        const isEdit = editingSubjectId !== null;

        const payload = {
            action: isEdit
                ? 'scgs_update_subject'
                : 'scgs_add_subject',
            nonce: SCGS_DATA.nonce,
            name: $('#sub-name').val(),
            max_score: $('#sub-score').val(),
            subject_group_id: $('#sub-group').val()
        };

        if (isEdit) {
            payload.id = editingSubjectId;
        }

        $.post(SCGS_DATA.ajax_url, payload, function (res) {
            if (!res || !res.success) {
                alert(res?.data?.message || 'Operation failed');
                return;
            }

            editingSubjectId = null;
            $('#sub-save').text('Add');
            $('#sub-name').val('');
            $('#sub-score').val('');
            $('#sub-group').val('');

            loadSubjects();
        });
    });

    $(document).on('click', '.sub-edit', function () {

        editingSubjectId = $(this).data('id');

        $('#sub-name').val($(this).data('name'));
        $('#sub-score').val($(this).data('score'));
        $('#sub-group').val($(this).data('group'));

        $('#sub-save').text('Update');
    });

    $(document).on('click', '.sub-delete', function () {
        if (!confirm('Delete this subject?')) return;

        $.post(SCGS_DATA.ajax_url, {
            action: 'scgs_delete_subject',
            nonce: SCGS_DATA.nonce,
            id: $(this).data('id')
        }, loadSubjects);
    });
}
/**
 * ======================================================
 * CLASSES PAGE
 * ======================================================
 */
if ($('#scgs-classes-root').length) {

    console.log('CLASSES PAGE DETECTED');
    let editingClassId = null;
    const root = $('#scgs-classes-root');

    root.html(`
        <h2>Add Class</h2>
        <p>
            <input type="text" id="class-name" placeholder="Class Name (e.g. 5A)" />
            <input type="text" id="class-grade" placeholder="Grade Level (e.g. Grade 5)" />
            <input type="text" id="class-year" placeholder="Academic Year (e.g. 2025–2026)" />
            <button type="button" class="button button-primary" id="class-add">Add</button>
        </p>
        <hr/>
        <div id="classes-table"></div>
    `);

    function loadClasses() {
        $.post(
            SCGS_DATA.ajax_url,
            {
                action: 'scgs_get_classes',
                nonce: SCGS_DATA.nonce
            },
            function (res) {

                if (!res || !res.success) {
                    $('#classes-table').html('<p>Error loading classes</p>');
                    return;
                }

                let html = `
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Grade</th>
                                <th>Academic Year</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                if (res.data.length === 0) {
                    html += `<tr><td colspan="5">No classes found</td></tr>`;
                } else {
                    res.data.forEach(c => {
                        html += `
                            <tr>
                                <td>${c.id}</td>
                                <td>${c.name}</td>
                                <td>${c.grade_level}</td>
                                <td>${c.academic_year}</td>
                                <td>
                                    <button class="button class-edit"
                                        data-id="${c.id}"
                                        data-name="${c.name}"
                                        data-grade="${c.grade_level}"
                                        data-year="${c.academic_year}">
                                        Edit
                                    </button>

                                    <button class="button class-delete"
                                        data-id="${c.id}">
                                        Delete
                                    </button>

                                </td>
                            </tr>
                        `;
                    });
                }

                html += '</tbody></table>';
                $('#classes-table').html(html);
            }
        );
    }

    loadClasses();

            $('#class-add').off('click').on('click', function () {

                const isEdit = editingClassId !== null;

                const payload = {
                    action: isEdit
                        ? 'scgs_update_class'
                        : 'scgs_add_class',
                    nonce: SCGS_DATA.nonce,
                    name: $('#class-name').val(),
                    grade_level: $('#class-grade').val(),
                    academic_year: $('#class-year').val()
                };

                if (isEdit) {
                    payload.id = editingClassId;
                }

                $.post(SCGS_DATA.ajax_url, payload, function (res) {

                    if (!res || !res.success) {
                        alert(res?.data?.message || 'Operation failed');
                        return;
                    }

                    // reset state
                    editingClassId = null;
                    $('#class-add').text('Add');
                    $('#class-name').val('');
                    $('#class-grade').val('');
                    $('#class-year').val('');

                    loadClasses();
                });
            });


    $(document).on('click', '.class-delete', function () {
        if (!confirm('Delete this class?')) return;

        $.post(
            SCGS_DATA.ajax_url,
            {
                action: 'scgs_delete_class',
                nonce: SCGS_DATA.nonce,
                id: $(this).data('id')
            },
            loadClasses
        );
    });

                $(document).on('click', '.class-edit', function () {

                editingClassId = $(this).data('id');

                $('#class-name').val($(this).data('name'));
                $('#class-grade').val($(this).data('grade'));
                $('#class-year').val($(this).data('year'));

                $('#class-add').text('Update');
});

}


//---------------------------------------------------------SUBJECT CRITERIA PAGE (CRUD)---------------------------------------------------------//
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
