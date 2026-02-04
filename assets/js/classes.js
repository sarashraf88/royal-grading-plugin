jQuery(function ($) {

    const root = $('#scgs-classes-root');
    if (!root.length) return;

    let editingId = null;
    let allClasses = [];

    // --------------------------------------------------
    // UI
    // --------------------------------------------------
    root.html(`
        <h2>Add / Edit Class</h2>
        <p>
            <input type="text" id="class-name" placeholder="Class Name (e.g. 12 A)" />

            <select id="class-grade">
                <option value="">Select Grade</option>
            </select>

            <select id="class-year">
                <option value="">Select Academic Year</option>
            </select>

            <button class="button button-primary" id="class-save">Add</button>
        </p>

        <p>
            <input type="text" id="class-search" placeholder="Search classes..." style="width:300px" />
        </p>

        <hr />
        <div id="classes-table"></div>
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

            $('#class-grade').html(html);
        });
    }

    // --------------------------------------------------
    // Load Academic Years
    // --------------------------------------------------
  function loadAcademicYears(selectedId = null) {

    $.post(royalPlugin.ajax_url, {
        action: 'scgs_get_academic_years',
        nonce: royalPlugin.nonce
    }, function (res) {

        if (!res.success) return;

        let html = '<option value="">Select Academic Year</option>';
        res.data.forEach(y => {
            html += `<option value="${y.id}">${y.name}</option>`;
        });

        $('#class-year').html(html);

        if (selectedId) {
            $('#class-year').val(selectedId);
        } else {
            // 🔥 DEFAULT TO ACTIVE YEAR
            setActiveAcademicYearAsDefault();
        }
    });
    function setActiveAcademicYearAsDefault() {

    $.post(royalPlugin.ajax_url, {
        action: 'scgs_get_active_academic_year',
        nonce: royalPlugin.nonce
    }, function (res) {

        if (res.success) {
            $('#class-year').val(res.data.id);
        }
    });
}

}

    // --------------------------------------------------
    // Render Table
    // --------------------------------------------------
    function renderTable(data) {

        if (!data.length) {
            $('#classes-table').html('<p>No classes found.</p>');
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

        data.forEach(c => {
            html += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.name}</td>
                    <td>${c.grade_name ?? '-'}</td>
                    <td>${c.year_name ?? '-'}</td>
                    <td>
                        <button class="button edit-class"
                            data-id="${c.id}"
                            data-name="${c.name}"
                            data-grade-id="${c.grade_id}"
                            data-year-id="${c.academic_year_id}">
                            Edit
                        </button>

                        <button class="button button-link-delete delete-class"
                            data-id="${c.id}">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        $('#classes-table').html(html);
    }

    // --------------------------------------------------
    // Load Classes
    // --------------------------------------------------
    function loadClasses() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_classes',
            nonce: royalPlugin.nonce
        }, function (res) {
            if (!res.success) return;

            allClasses = res.data;
            renderTable(allClasses);
        });
    }

    // --------------------------------------------------
    // Save (Add / Update)
    // --------------------------------------------------
    $('#class-save').on('click', function () {

        const payload = {
            action: editingId ? 'scgs_update_class' : 'scgs_add_class',
            nonce: royalPlugin.nonce,
            name: $('#class-name').val().trim(),
            grade_id: $('#class-grade').val(),
            academic_year_id: $('#class-year').val()
        };

        if (editingId) {
            payload.id = editingId;
        }

        console.log('Saving class:', payload);

        // Validation
        if (!payload.name || !payload.grade_id || !payload.academic_year_id) {
            alert('Missing required fields');
            return;
        }

        $.post(royalPlugin.ajax_url, payload, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Save failed');
                return;
            }

            resetForm();
            loadClasses();
        });
    });

    // --------------------------------------------------
    // Edit
    // --------------------------------------------------
    $(document).on('click', '.edit-class', function () {

        editingId = $(this).data('id');

        $('#class-name').val($(this).data('name'));
        $('#class-grade').val($(this).data('grade'));
        
        loadAcademicYears($(this).data('year'));

        $('#class-save').text('Update');
    });


    // --------------------------------------------------
    // Delete
    // --------------------------------------------------
    $(document).on('click', '.delete-class', function () {

        if (!confirm('Delete this class?')) return;

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_delete_class',
            nonce: royalPlugin.nonce,
            id: $(this).data('id')
        }, function () {
            loadClasses();
        });
    });

    // --------------------------------------------------
    // Search
    // --------------------------------------------------
    $('#class-search').on('input', function () {
        const q = $(this).val().toLowerCase();

        const filtered = allClasses.filter(c =>
            c.name.toLowerCase().includes(q) ||
            (c.grade_name ?? '').toLowerCase().includes(q) ||
            (c.year_name ?? '').toLowerCase().includes(q)
        );

        renderTable(filtered);
    });

    // --------------------------------------------------
    // Reset
    // --------------------------------------------------
    function resetForm() {
        editingId = null;
        $('#class-name').val('');
        $('#class-grade').val('');
        $('#class-save').text('Add');
    }

    // --------------------------------------------------
    // Init
    // --------------------------------------------------
    loadGrades();
    loadAcademicYears();
    loadClasses();

});
