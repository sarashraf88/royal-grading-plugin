jQuery(function ($) {

    const root = $('#scgs-subject-groups-root');
    if (!root.length) return;

    let editingId = null;
    let allGroups = [];

    // --------------------------------------------------
    // UI
    // --------------------------------------------------
    root.html(`
        <h2>Add / Edit Subject Group</h2>
        <p>
            <input type="text" id="group-name" placeholder="Group Name">
            <select id="group-grade">
                <option value="">Select Grade</option>
            </select>
            <label style="margin-left:10px">
                <input type="checkbox" id="group-required"> Required
            </label>
            <button class="button button-primary" id="group-save">Add</button>
        </p>

        <hr>

        <input type="text"
               id="group-search"
               placeholder="Search subject groups..."
               style="width:300px;margin-bottom:10px">

        <div id="groups-table"></div>
    `);

    // --------------------------------------------------
    // Load Grades (for dropdown)
    // --------------------------------------------------
    function loadGrades() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_grades',
            nonce: royalPlugin.nonce
        }, function (res) {

            if (!res || !res.success) return;

            let html = `<option value="">Select Grade</option>`;
            res.data.forEach(g => {
                html += `<option value="${g.id}">${g.name}</option>`;
            });

            $('#group-grade').html(html);
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

            if (!res || !res.success) {
                console.error('Failed to load subject groups');
                return;
            }

            allGroups = res.data;
            renderTable(allGroups);
        });
    }

    // --------------------------------------------------
    // Render Table
    // --------------------------------------------------
    function renderTable(data) {

        if (!data.length) {
            $('#groups-table').html('<p>No subject groups found.</p>');
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

        data.forEach(g => {
            html += `
                <tr>
                    <td>${g.id}</td>
                    <td>${g.name}</td>
                    <td>${g.grade_name ?? '-'}</td>
                    <td>${g.is_required == 1 ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="button edit-group"
                            data-id="${g.id}"
                            data-name="${g.name}"
                            data-grade="${g.grade_id}"
                            data-required="${g.is_required}">
                            Edit
                        </button>
                        <button class="button button-link-delete delete-group"
                            data-id="${g.id}">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        $('#groups-table').html(html);
    }

    // --------------------------------------------------
    // Save (Add / Update)
    // --------------------------------------------------
    $('#group-save').on('click', function () {

        const name = $('#group-name').val().trim();
        const gradeId = $('#group-grade').val();

        if (!name || !gradeId) {
            alert('Group name and grade are required');
            return;
        }

        const action = editingId
            ? 'scgs_update_subject_group'
            : 'scgs_add_subject_group';

        $.post(royalPlugin.ajax_url, {
            action,
            nonce: royalPlugin.nonce,
            id: editingId,
            name,
            grade_id: gradeId,
            is_required: $('#group-required').is(':checked') ? 1 : 0
        }, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Save failed');
                return;
            }

            resetForm();
            loadGroups();
        });
    });

    // --------------------------------------------------
    // Edit
    // --------------------------------------------------
    $(document).on('click', '.edit-group', function () {

        editingId = $(this).data('id');

        $('#group-name').val($(this).data('name'));
        $('#group-grade').val($(this).data('grade'));
        $('#group-required').prop('checked', $(this).data('required') == 1);

        $('#group-save').text('Update');
    });

    // --------------------------------------------------
    // Delete
    // --------------------------------------------------
    $(document).on('click', '.delete-group', function () {

        if (!confirm('Delete this subject group?')) return;

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_delete_subject_group',
            nonce: royalPlugin.nonce,
            id: $(this).data('id')
        }, function () {
            loadGroups();
        });
    });

    // --------------------------------------------------
    // Search (SAFE)
    // --------------------------------------------------
    $('#group-search').on('keyup', function () {

        const q = $(this).val().toLowerCase();

        const filtered = allGroups.filter(g =>
            g.name.toLowerCase().includes(q) ||
            (g.grade_name ?? '').toLowerCase().includes(q) ||
            String(g.id).includes(q)
        );

        renderTable(filtered);
    });

    // --------------------------------------------------
    // Reset
    // --------------------------------------------------
    function resetForm() {
        editingId = null;
        $('#group-name').val('');
        $('#group-grade').val('');
        $('#group-required').prop('checked', false);
        $('#group-save').text('Add');
    }

    // --------------------------------------------------
    // Init
    // --------------------------------------------------
    loadGrades();
    loadGroups();

});
