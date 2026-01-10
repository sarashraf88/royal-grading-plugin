jQuery(function ($) {

    // ======================================================
    // CLASSES MODULE
    // ======================================================

    const root = $('#scgs-classes-root');

    if (!root.length) {
        return;
    }

    console.log('Classes module loaded');

    // --------------------------------------------------
    // Render base UI
    // --------------------------------------------------
    root.html(`
        <h2>Add Class</h2>
        <p>
            <input type="text" id="class-name" placeholder="Class Name (e.g. 5A)" />
            <input type="text" id="class-grade" placeholder="Grade Level (e.g. Grade 5)" />
            <input type="text" id="class-year" placeholder="Academic Year (e.g. 2025-2026)" />
            <button type="button" class="button button-primary" id="class-add">
                Add
            </button>
        </p>
        <hr/>
        <div id="classes-table"></div>
    `);

    // --------------------------------------------------
    // Load classes
    // --------------------------------------------------
    function loadClasses() {
        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_get_classes',
                nonce: royalPlugin.nonce
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
                                <th>Class</th>
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
                                    <button type="button"
                                        class="button class-delete"
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

    // --------------------------------------------------
    // Add class
    // --------------------------------------------------
    $('#class-add').on('click', function () {

        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_add_class',
                nonce: royalPlugin.nonce,
                name: $('#class-name').val(),
                grade_level: $('#class-grade').val(),
                academic_year: $('#class-year').val()
            },
            function (res) {

                if (!res || !res.success) {
                    alert(res?.data?.message || 'Failed to add class');
                    return;
                }

                $('#class-name').val('');
                $('#class-grade').val('');
                $('#class-year').val('');

                loadClasses();
            }
        );
    });

    // --------------------------------------------------
    // Delete class
    // --------------------------------------------------
    $(document).on('click', '.class-delete', function () {
        if (!confirm('Delete this class?')) return;

        $.post(
            royalPlugin.ajax_url,
            {
                action: 'scgs_delete_class',
                nonce: royalPlugin.nonce,
                id: $(this).data('id')
            },
            loadClasses
        );
    });

});
