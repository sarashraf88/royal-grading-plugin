jQuery(document).ready(function ($) {

    // ======================================================
    // CLASSES PAGE
    // ======================================================

    if (!$('#scgs-classes-root').length) {
        return;
    }

    console.log('CLASSES PAGE DETECTED');

    let editingClassId = null;
    let activeAcademicYearId = null;

    const root = $('#scgs-classes-root');

    // ------------------------------------------------------
    // Render page structure
    // ------------------------------------------------------
    root.html(`
        <h2>Add Class</h2>
        <p>
            <input type="text" id="class-name" placeholder="Class Name" />
            <input type="text" id="class-grade" placeholder="Grade Level" />

            <select id="class-year">
                <option value="">Select Academic Year</option>
            </select>

            <button type="button" class="button button-primary" id="class-add">
                Add
            </button>
        </p>

        <hr/>
        <div id="class-table"></div>
    `);

    // ======================================================
    // Load Academic Years (Dropdown)
    // ======================================================
    function loadAcademicYears() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_academic_years',
            nonce: royalPlugin.nonce
        }, function (res) {

            if (!res || !res.success) {
                alert('Failed to load academic years');
                return;
            }

            const select = $('#class-year');
            select.empty().append('<option value="">Select Academic Year</option>');

            activeAcademicYearId = null;

            res.data.forEach(year => {
                if (year.is_active == 1) {
                    activeAcademicYearId = year.id;
                }

                select.append(`
                    <option value="${year.id}">
                        ${year.name}
                    </option>
                `);
            });

            // Preselect active academic year
            if (activeAcademicYearId) {
                select.val(activeAcademicYearId);
            }
        });
    }

    // ======================================================
    // Load Classes Table
    // ======================================================
    function loadClasses() {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_classes',
            nonce: royalPlugin.nonce
        }, function (res) {

            if (!res || !res.success) {
                $('#class-table').html('<p>Error loading classes</p>');
                return;
            }

            let html = `
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Grade Level</th>
                            <th>Academic Year</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (res.data.length === 0) {
                html += `
                    <tr>
                        <td colspan="5">No classes found</td>
                    </tr>
                `;
            } else {
                res.data.forEach(c => {
                    html += `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.name}</td>
                            <td>${c.grade_level}</td>
                            <td>${c.academic_year}</td>

                            <td>
                             <button
                                class="button class-edit"
                                data-id="${c.id}"
                                data-name="${c.name}"
                                data-grade="${c.grade_level}"
                                data-year="${c.academic_year}">
                                Edit
                            </button>


                                <button
                                    class="button button-link-delete class-delete"
                                    data-id="${c.id}">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            html += '</tbody></table>';
            $('#class-table').html(html);
        });
    }

    // ======================================================
    // Add / Update Class
    // ======================================================
    $('#class-add').on('click', function () {

        if (!$('#class-name').val()) {
            alert('Please enter class name');
            return;
        }

        if (!$('#class-grade').val()) {
            alert('Please enter grade level');
            return;
        }

        if (!$('#class-year').val()) {
            alert('Please select academic year');
            return;
        }

        const actionName = editingClassId
            ? 'scgs_update_class'
            : 'scgs_add_class';

        const payload = {
            action: actionName,
            nonce: royalPlugin.nonce,
            name: $('#class-name').val(),
            grade_level: $('#class-grade').val(),
            academic_year: $('#class-year option:selected').text()



        };

        if (editingClassId) {
            payload.id = editingClassId;
        }

        $.post(royalPlugin.ajax_url, payload, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Operation failed');
                return;
            }

            // Reset form
            editingClassId = null;
            $('#class-name').val('');
            $('#class-grade').val('');
            $('#class-year').val(activeAcademicYearId || '');
            $('#class-add').text('Add');

            loadClasses();
        });
    });

   
       // ======================================================
        // Edit Class
        // ======================================================

        console.log('EDIT year value =', $(this).data('year'));

        $(document).on('click', '.class-edit', function () {

    console.log('EDIT year value =', $(this).data('year'));

    editingClassId = $(this).data('id');

    $('#class-name').val($(this).data('name'));
    $('#class-grade').val($(this).data('grade'));

    const yearText = $(this).data('year');

    $('#class-year').val('');

    $('#class-year option').each(function () {
        if ($(this).text().trim() === String(yearText).trim()) {
            $(this).prop('selected', true);
        }
    });

    $('#class-add').text('Update');
});

    // ======================================================
    // Delete Class
    // ======================================================
    $(document).on('click', '.class-delete', function () {

        const id = $(this).data('id');

        if (!confirm('Are you sure you want to delete this class?')) {
            return;
        }

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_delete_class',
            nonce: royalPlugin.nonce,
            id: id
        }, function (res) {

            if (!res || !res.success) {
                alert(res?.data?.message || 'Delete failed');
                return;
            }

            loadClasses();
        });
    });

    // ======================================================
    // Init
    // ======================================================
    loadAcademicYears();
    loadClasses();

});
