jQuery(function ($) {

    const root = $('#scgs-subjects-root');
    if (!root.length) return;

    let editingId = null;
    
    // --------------------------------------------------
// Search Subjects (client-side)
// --------------------------------------------------
$(document).on('input', '#subject-search', function () {

    const keyword = $(this).val().toLowerCase();

    $('#subjects-table tbody tr').each(function () {

        const rowText = $(this).text().toLowerCase();

        if (rowText.includes(keyword)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
});



    // --------------------------------------------------
    // Render UI
    // --------------------------------------------------
    root.html(`
        <h2>Add / Edit Subject</h2>
        <p>
            <input type="text" id="subject-name" placeholder="Subject Name">

            <select id="subject-grade">
                <option value="">Select Grade</option>
            </select>

            <select id="subject-group">
                <option value="">No Group (Standalone)</option>
            </select>

            <input type="number" id="subject-max-score" placeholder="Max Score" value="100">

            <button class="button button-primary" id="subject-save">Add</button>
        </p>
        <hr>
        <p>
            <input type="text" id="subject-search"
                placeholder="Search by subject, grade, or group..."
                style="width:300px;">
        </p>
        <div id="subjects-table"></div>
    `);

    // --------------------------------------------------
    // Load Grades
    // --------------------------------------------------
    function loadGrades() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_grades',
            nonce: royalPlugin.nonce
        }, function (res) {
            if (!res.success) return;

            let html = `<option value="">Select Grade</option>`;
            res.data.forEach(g => {
                html += `<option value="${g.id}">${g.name}</option>`;
            });

            $('#subject-grade').html(html);
        });
    }

    // --------------------------------------------------
    // Load Subject Groups
    // --------------------------------------------------
    function loadGroups() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_subject_groups',
            nonce: royalPlugin.nonce
        }, function (res) {
            if (!res.success) return;

            let html = `<option value="">No Group (Standalone)</option>`;
            res.data.forEach(g => {
                html += `<option value="${g.id}" data-grade="${g.grade_id}">
                    ${g.name}
                </option>`;
            });

            $('#subject-group').html(html);
        });
    }

    // --------------------------------------------------
    // Auto-set Grade when Group selected
    // --------------------------------------------------
    $('#subject-group').on('change', function () {
        const gradeId = $('option:selected', this).data('grade');

        if (gradeId) {
            $('#subject-grade').val(gradeId).prop('disabled', true);
        } else {
            $('#subject-grade').prop('disabled', false).val('');
        }
    });

    // --------------------------------------------------
    // Load Subjects
    // --------------------------------------------------
    function loadSubjects() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_subjects',
            nonce: royalPlugin.nonce
        }, function (res) {
            if (!res.success) return;

            let html = `
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Grade</th>
                            <th>Group</th>
                            <th>Max</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            res.data.forEach(s => {
                html += `
                    <tr>
                        <td>${s.id}</td>
                        <td>${s.name}</td>
                        <td>${s.grade_name ?? '-'}</td>
                        <td>${s.group_name ?? '-'}</td>
                        <td>${s.max_score}</td>
                        <td>
                            <button class="button edit-subject"
                                data-id="${s.id}"
                                data-name="${s.name}"
                                data-max="${s.max_score}"
                                data-grade="${s.grade_id ?? ''}"
                                data-group="${s.subject_group_id ?? ''}">
                                Edit
                            </button>
                            <button class="button button-link-delete delete-subject"
                                data-id="${s.id}">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            $('#subjects-table').html(html);
        });
    }

    // --------------------------------------------------
    // Save (Add / Update)
    // --------------------------------------------------
    $('#subject-save').on('click', function () {

        console.log('SAVE CLICKED — editingId =', editingId);

        const actionName = editingId
            ? 'scgs_update_subject'
            : 'scgs_add_subject';

        const payload = {
            action: actionName,
            nonce: royalPlugin.nonce,
            name: $('#subject-name').val(),
            max_score: $('#subject-max-score').val(),
            grade_id: $('#subject-grade').val(),
            subject_group_id: $('#subject-group').val()
        };

        if (editingId) {
            payload.id = editingId;
        }

        if (!payload.name || !payload.max_score || !payload.grade_id) {
            alert('Please fill all required fields');
            return;
        }

        $.post(royalPlugin.ajax_url, payload, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Save failed');
                return;
            }

            // Reset form
            editingId = null;
            $('#subject-name').val('');
            $('#subject-max-score').val('');
            $('#subject-grade').prop('disabled', false).val('');
            $('#subject-group').val('');
            $('#subject-save').text('Add');

            loadSubjects();
        });
    });

    // --------------------------------------------------
    // Edit
    // --------------------------------------------------
    $(document).on('click', '.edit-subject', function () {

        editingId = $(this).data('id');

        $('#subject-name').val($(this).data('name'));
        $('#subject-max-score').val($(this).data('max'));
        $('#subject-grade')
            .val($(this).data('grade'))
            .prop('disabled', !!$(this).data('group'));
        $('#subject-group').val($(this).data('group'));

        $('#subject-save').text('Update');
    });

    // --------------------------------------------------
    // Delete
    // --------------------------------------------------
    $(document).on('click', '.delete-subject', function () {

        if (!confirm('Delete this subject?')) return;

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_delete_subject',
            nonce: royalPlugin.nonce,
            id: $(this).data('id')
        }, loadSubjects);
    });

    // --------------------------------------------------
    // Init
    // --------------------------------------------------
    loadGrades();
    loadGroups();
    loadSubjects();

});
