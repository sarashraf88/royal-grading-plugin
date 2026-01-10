jQuery(function ($) {

    // ======================================================
    // SUBJECT GROUPS MODULE
    // ======================================================

    let editingGroupId = null;
    const root = $('#scgs-subject-groups-root');

    if (!root.length) {
        return;
    }

    // Render base UI
    root.html(`
        <h2>Add / Edit Subject Group</h2>
        <p>
            <input type="text" id="sg-name" placeholder="Group Name" />
            <input type="text" id="sg-grade" placeholder="Grade Level" />
            <label style="margin-left:10px">
                <input type="checkbox" id="sg-required" /> Required
            </label>
            <button type="button" class="button button-primary" id="sg-save">
                Add
            </button>
            <button type="button" class="button" id="sg-cancel" style="display:none">
                Cancel
            </button>
        </p>
        <hr/>
        <div id="sg-table"></div>
    `);

    /**
     * Load subject groups table
     */
    function loadSubjectGroups() {
        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_get_subject_groups',
                nonce: royalPlugin.nonce
            },
            function (res) {

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
            }
        );
    }

    loadSubjectGroups();

    /**
     * Add / Update subject group
     */
    $('#sg-save').on('click', function () {

        const actionName = editingGroupId
            ? 'scgs_update_subject_group'
            : 'scgs_add_subject_group';

        const payload = {
            action: actionName,
            nonce: royalPlugin.nonce,
            name: $('#sg-name').val(),
            grade_level: $('#sg-grade').val(),
            is_required: $('#sg-required').is(':checked') ? 1 : 0
        };

        if (editingGroupId) {
            payload.id = editingGroupId;
        }

        $.post(royalPlugin.ajax_url, payload, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Operation failed');
                return;
            }

            resetForm();
            loadSubjectGroups();
        });
    });

    /**
     * Edit subject group
     */
    $(document).on('click', '.sg-edit', function () {

        editingGroupId = $(this).data('id');

        $('#sg-name').val($(this).data('name'));
        $('#sg-grade').val($(this).data('grade'));
        $('#sg-required').prop(
            'checked',
            $(this).data('required') == 1
        );

        $('#sg-save').text('Update');
        $('#sg-cancel').show();
    });

    /**
     * Delete subject group
     */
    $(document).on('click', '.sg-delete', function () {
        if (!confirm('Delete this subject group?')) return;

        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_delete_subject_group',
                nonce: royalPlugin.nonce,
                id: $(this).data('id')
            },
            loadSubjectGroups
        );
    });

    /**
     * Cancel edit
     */
    $('#sg-cancel').on('click', function () {
        resetForm();
    });

    /**
     * Reset form to Add mode
     */
    function resetForm() {
        editingGroupId = null;
        $('#sg-name').val('');
        $('#sg-grade').val('');
        $('#sg-required').prop('checked', false);
        $('#sg-save').text('Add');
        $('#sg-cancel').hide();
    }

});
