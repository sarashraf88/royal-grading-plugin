jQuery(function ($) {

    const root = $('#scgs-grades-root');
    if (!root.length) return;

    let editingId = null;
    let allGrades = [];

    // --------------------------------------------------
    // UI
    // --------------------------------------------------
    root.html(`
        <h2>Add / Edit Grade</h2>
        <p>
            <input type="text" id="grade-name" placeholder="Grade Name (e.g. Grade 10)">
            <button class="button button-primary" id="grade-save">Add</button>
        </p>

        <hr>

        <input type="text"
               id="grade-search"
               placeholder="Search grades..."
               style="width:250px;margin-bottom:10px">

        <div id="grades-table"></div>
    `);

    // --------------------------------------------------
    // Load Grades
    // --------------------------------------------------
    function loadGrades() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_grades',
            nonce: royalPlugin.nonce
        }, function (res) {

            if (!res || !res.success) {
                console.error('Failed to load grades', res);
                return;
            }

            allGrades = res.data;
            renderTable(allGrades);
        });
    }

    // --------------------------------------------------
    // Render Table
    // --------------------------------------------------
    function renderTable(data) {

        if (!data.length) {
            $('#grades-table').html('<p>No grades found.</p>');
            return;
        }

        let html = `
            <table class="widefat striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
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
                    <td>
                        <button class="button edit-grade"
                            data-id="${g.id}"
                            data-name="${g.name}">
                            Edit
                        </button>
                        <button class="button button-link-delete delete-grade"
                            data-id="${g.id}">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        $('#grades-table').html(html);
    }

    loadGrades();

    // --------------------------------------------------
    // Add / Update
    // --------------------------------------------------
    $('#grade-save').on('click', function () {

        const name = $('#grade-name').val().trim();
        if (!name) {
            alert('Grade name is required');
            return;
        }

        const action = editingId
            ? 'scgs_update_grade'
            : 'scgs_add_grade';

        $.post(royalPlugin.ajax_url, {
            action,
            nonce: royalPlugin.nonce,
            id: editingId,
            name
        }, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Failed to save grade');
                return;
            }

            editingId = null;
            $('#grade-name').val('');
            $('#grade-save').text('Add');

            loadGrades();
        });
    });

    // --------------------------------------------------
    // Edit
    // --------------------------------------------------
    $(document).on('click', '.edit-grade', function () {
        editingId = $(this).data('id');
        $('#grade-name').val($(this).data('name'));
        $('#grade-save').text('Update');
    });

    // --------------------------------------------------
    // Delete
    // --------------------------------------------------
    $(document).on('click', '.delete-grade', function () {
        if (!confirm('Delete this grade?')) return;

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_delete_grade',
            nonce: royalPlugin.nonce,
            id: $(this).data('id')
        }, function () {
            loadGrades();
        });
    });

    // --------------------------------------------------
    // Search (NO RESET ISSUE)
    // --------------------------------------------------
    $('#grade-search').on('keyup', function () {

        const q = $(this).val().toLowerCase();

        const filtered = allGrades.filter(g =>
            g.name.toLowerCase().includes(q) ||
            String(g.id).includes(q)
        );

        renderTable(filtered);
    });

});
