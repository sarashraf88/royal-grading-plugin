jQuery(function ($) {

    const root = $('#scgs-subject-criteria-root');

    if (!root.length) {
        return;
    }

    console.log('Subject Criteria module loaded');

    let editingId = null;

    // --------------------------------------------------
    // Render UI
    // --------------------------------------------------
    root.html(`
        <h2>Add / Edit Subject Criteria</h2>
        <p>
            <input type="text" id="crit-name" placeholder="Criteria Name (e.g. Exam)" />
            <input type="number" id="crit-weight" placeholder="Weight (%)" />
            <select id="crit-subject"></select>
            <button type="button" class="button button-primary" id="crit-save">
                Add
            </button>
            <button type="button" class="button" id="crit-cancel" style="display:none">
                Cancel
            </button>
        </p>
        <hr/>
        <div id="criteria-table"></div>
    `);

    // --------------------------------------------------
    // Load Subjects (dropdown)
    // --------------------------------------------------
    function loadSubjects() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_subjects',
            nonce: royalPlugin.nonce
        }, function (res) {
            if (!res || !res.success) return;

            let options = '<option value="">Select Subject</option>';
            res.data.forEach(s => {
                options += `<option value="${s.id}">${s.name}</option>`;
            });

            $('#crit-subject').html(options);
        });
    }

    // --------------------------------------------------
    // Load Criteria
    // --------------------------------------------------
    function loadCriteria() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_subject_criteria',
            nonce: royalPlugin.nonce
        }, function (res) {

            if (!res || !res.success) {
                $('#criteria-table').html('<p>Error loading criteria</p>');
                return;
            }

            let html = `
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Criteria</th>
                            <th>Weight</th>
                            <th>Subject</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (res.data.length === 0) {
                html += `<tr><td colspan="5">No criteria found</td></tr>`;
            } else {
                res.data.forEach(c => {
                    html += `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.name}</td>
                            <td>${c.weight}%</td>
                            <td>${c.subject_name}</td>
                            <td>
                                <button class="button crit-edit"
                                    data-id="${c.id}"
                                    data-name="${c.name}"
                                    data-weight="${c.weight}"
                                    data-subject="${c.subject_id}">
                                    Edit
                                </button>
                                <button class="button crit-delete"
                                    data-id="${c.id}">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            html += '</tbody></table>';
            $('#criteria-table').html(html);
        });
    }

    loadSubjects();
    loadCriteria();

    // --------------------------------------------------
    // Add / Update
    // --------------------------------------------------
    $('#crit-save').on('click', function () {

        const actionName = editingId
            ? 'scgs_update_subject_criteria'
            : 'scgs_add_subject_criteria';

        $.post(royalPlugin.ajax_url, {
            action: actionName,
            nonce: royalPlugin.nonce,
            id: editingId,
            name: $('#crit-name').val(),
            weight: $('#crit-weight').val(),
            subject_id: $('#crit-subject').val()
        }, function () {
            resetForm();
            loadCriteria();
        });
    });

    // --------------------------------------------------
    // Edit
    // --------------------------------------------------
    $(document).on('click', '.crit-edit', function () {

        editingId = $(this).data('id');

        $('#crit-name').val($(this).data('name'));
        $('#crit-weight').val($(this).data('weight'));
        $('#crit-subject').val($(this).data('subject'));

        $('#crit-save').text('Update');
        $('#crit-cancel').show();
    });

    // --------------------------------------------------
    // Delete
    // --------------------------------------------------
    $(document).on('click', '.crit-delete', function () {
        if (!confirm('Delete this criteria?')) return;

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_delete_subject_criteria',
            nonce: royalPlugin.nonce,
            id: $(this).data('id')
        }, loadCriteria);
    });

    // --------------------------------------------------
    // Cancel
    // --------------------------------------------------
    $('#crit-cancel').on('click', function () {
        resetForm();
    });

    function resetForm() {
        editingId = null;
        $('#crit-name').val('');
        $('#crit-weight').val('');
        $('#crit-subject').val('');
        $('#crit-save').text('Add');
        $('#crit-cancel').hide();
    }

});
