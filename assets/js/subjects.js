jQuery(function ($) {

    // ======================================================
    // SUBJECTS MODULE
    // ======================================================

    const root = $('#scgs-subjects-root');

    if (!root.length) {
        return;
    }

    console.log('Subjects module loaded');
    let editingSubjectId = null;


    // --------------------------------------------------
    // Render base UI
    // --------------------------------------------------
    root.html(`
        <h2>Add Subject</h2>
        <p>
            <input type="text" id="sub-name" placeholder="Subject Name" />
            <input type="number" id="sub-max" placeholder="Max Score" />
            <select id="sub-group"></select>
            <button type="button" class="button button-primary" id="sub-add">
                Add
            </button>
        </p>
        <hr/>
        <div id="subjects-table"></div>
    `);

    // --------------------------------------------------
    // Load Subject Groups (for dropdown)
    // --------------------------------------------------
    function loadGroups() {
        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_get_subject_groups',
                nonce: royalPlugin.nonce
            },
            function (res) {
                if (!res || !res.success) {
                    $('#sub-group').html('<option value="">No groups found</option>');
                    return;
                }

                let options = '<option value="">Select Group</option>';
                res.data.forEach(g => {
                    options += `<option value="${g.id}">${g.name}</option>`;
                });

                $('#sub-group').html(options);
            }
        );
    }

    // --------------------------------------------------
    // Load Subjects
    // --------------------------------------------------
    function loadSubjects() {
        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_get_subjects',
                nonce: royalPlugin.nonce
            },
            function (res) {

                if (!res || !res.success) {
                    $('#subjects-table').html('<p>Error loading subjects</p>');
                    return;
                }

                let html = `
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                    <th>Subject</th>
                                    <th>Max Score</th>
                                    <th>Group</th>
                                    <th>Action</th>

                            </tr>
                        </thead>
                        <tbody> 
                `;

                if (res.data.length === 0) {
                    html += `<tr><td colspan="4">No subjects found</td></tr>`;
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
                                        data-max="${s.max_score}"
                                        data-group="${s.group_id ?? ''}">
                                        Edit
                                    </button>
                                      <button class="button button-link-delete sub-delete"
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
            }
        );
    }

    // --------------------------------------------------
    // Initial load
    // --------------------------------------------------
    loadGroups();
    loadSubjects();
    $(document).on('click', '.sub-edit', function () {

    editingSubjectId = $(this).data('id');

    $('#sub-name').val($(this).data('name'));
    $('#sub-max').val($(this).data('max'));
    $('#sub-group').val($(this).data('group'));

    $('#sub-add').text('Update');
});


  //delete-----------------
  $(document).on('click', '.sub-delete', function () {

    const id = $(this).data('id');

    if (!confirm('Are you sure you want to delete this subject?')) {
        return;
    }

    $.post(royalPlugin.ajax_url, {
        action: 'scgs_delete_subject',
        nonce: royalPlugin.nonce,
        id: id
    }, function (res) {

        if (!res || !res.success) {
            alert(res?.data?.message || 'Delete failed');
            return;
        }

        loadSubjects();
    });
});



    // --------------------------------------------------
    // Add Subject
    // --------------------------------------------------
   $('#sub-add').on('click', function () {

    const actionName = editingSubjectId
        ? 'scgs_update_subject'
        : 'scgs_add_subject';

    const payload = {
        action: actionName,
        nonce: royalPlugin.nonce,
        name: $('#sub-name').val(),
        max_score: $('#sub-max').val(),
        group_id: $('#sub-group').val()
    };

    if (editingSubjectId) {
        payload.id = editingSubjectId;
    }

    $.post(royalPlugin.ajax_url, payload, function (res) {

        if (!res || !res.success) {
            alert(res?.data?.message || 'Operation failed');
            return;
        }

        editingSubjectId = null;
        $('#sub-name').val('');
        $('#sub-max').val('');
        $('#sub-group').val('');
        $('#sub-add').text('Add');

        loadSubjects();
    });
});


});
