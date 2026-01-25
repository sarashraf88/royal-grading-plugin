jQuery(function ($) {

    const root = $('#scgs-subject-groups-root');
    if (!root.length) return;

    console.log('Subject Groups module loaded');

    // ======================================================
    // STATE
    // ======================================================
    let editingId = null;

    // ======================================================
    // RENDER UI
    // ======================================================
    root.html(`
        <h2>Add Subject Group</h2>

        <p>
            <input type="text" id="group-name" placeholder="Group Name" />

            <select id="group-grade">
                <option value="">Loading grades...</option>
            </select>

            <label style="margin-left:10px">
                <input type="checkbox" id="group-required" checked />
                Required
            </label>

            <button type="button" class="button button-primary" id="group-save">
                Add
            </button>
        </p>

        <hr />

        <div id="groups-table"></div>
    `);

    // ======================================================
    // LOAD GRADES (for dropdown)
    // ======================================================
    function loadGrades() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_grades',
            nonce: royalPlugin.nonce
        }, function (res) {

            console.log('Grades AJAX response:', res);

            if (!res || !res.success) {
                $('#group-grade').html('<option value="">Failed to load grades</option>');
                return;
            }

            let options = '<option value="">Select Grade</option>';

            res.data.forEach(g => {
                options += `<option value="${g.id}">${g.name}</option>`;
            });

            $('#group-grade').html(options);
        });
    }

    // ======================================================
    // LOAD SUBJECT GROUPS (TABLE)
    // ======================================================
    function loadGroups() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_subject_groups',
            nonce: royalPlugin.nonce
        }, function (res) {

            if (!res || !res.success) {
                $('#groups-table').html('<p>Error loading subject groups</p>');
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
                            <th>Actions</th>
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
                            <td>${g.grade_name ?? '-'}</td>
                            <td>${g.is_required == 1 ? 'Yes' : 'No'}</td>
                            <td>
                                <button class="button group-edit"
                                    data-id="${g.id}"
                                    data-name="${g.name}"
                                    data-grade="${g.grade_id}"
                                    data-required="${g.is_required}">
                                    Edit
                                </button>

                                <button class="button button-link-delete group-delete"
                                    data-id="${g.id}">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            html += '</tbody></table>';
            $('#groups-table').html(html);
        });
    }

    // ======================================================
    // INITIAL LOAD
    // ======================================================
    loadGrades();
    loadGroups();

    // ======================================================
    // ADD / UPDATE SUBJECT GROUP
    // ======================================================
    $(document).on('click', '#group-save', function () {

        const name = $('#group-name').val();
        const gradeId = $('#group-grade').val();

        if (!name || !gradeId) {
            alert('Please enter group name and select grade');
            return;
        }

        const payload = {
            action: editingId ? 'scgs_update_subject_group' : 'scgs_add_subject_group',
            nonce: royalPlugin.nonce,
            name: name,
            grade_id: gradeId,
            is_required: $('#group-required').is(':checked') ? 1 : 0
        };

        if (editingId) {
            payload.id = editingId;
        }

        console.log('Saving Subject Group:', payload);

        $.post(royalPlugin.ajax_url, payload, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Operation failed');
                return;
            }

            // Reset form
            editingId = null;
            $('#group-name').val('');
            $('#group-grade').val('');
            $('#group-required').prop('checked', true);
            $('#group-save').text('Add');

            loadGroups();
        });
    });

    // ======================================================
    // EDIT SUBJECT GROUP
    // ======================================================
    $(document).on('click', '.group-edit', function () {

        editingId = $(this).data('id');

        $('#group-name').val($(this).data('name'));
        $('#group-grade').val($(this).data('grade'));
        $('#group-required').prop('checked', $(this).data('required') == 1);

        $('#group-save').text('Update');
    });

    // ======================================================
    // DELETE SUBJECT GROUP
    // ======================================================
    $(document).on('click', '.group-delete', function () {

        if (!confirm('Delete this subject group?')) return;

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_delete_subject_group',
            nonce: royalPlugin.nonce,
            id: $(this).data('id')
        }, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Delete failed');
                return;
            }

            loadGroups();
        });
    });

});
