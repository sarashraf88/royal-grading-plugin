jQuery(function ($) {

    // ======================================================
    // SUBJECTS MODULE
    // ======================================================

    const root = $('#scgs-subjects-root');

    if (!root.length) {
        return;
    }

    console.log('Subjects module loaded');

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

    // --------------------------------------------------
    // Add Subject
    // --------------------------------------------------
    $('#sub-add').on('click', function () {

        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_add_subject',
                nonce: royalPlugin.nonce,
                name: $('#sub-name').val(),
                max_score: $('#sub-max').val(),
                group_id: $('#sub-group').val()
            },
            function (res) {

                if (!res || !res.success) {
                    alert(res?.data?.message || 'Failed to add subject');
                    return;
                }

                $('#sub-name').val('');
                $('#sub-max').val('');
                $('#sub-group').val('');

                loadSubjects();
            }
        );
    });

});
