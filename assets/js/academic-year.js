jQuery(function ($) {
    let allYears = [];


    const root = $('#scgs-academic-year-root');
    if (!root.length) return;

    let editingId = null;

    root.html(`
        <h2>Add / Edit Academic Year</h2>
        <p>
            <input type="text" id="year-name" placeholder="Academic Year (e.g. 2025-2026)">
            <input type="date" id="year-start">
            <input type="date" id="year-end">

            <button class="button button-primary" id="year-save">Add</button>
            <button class="button" id="year-cancel" style="display:none">Cancel</button>
        </p>
        <hr>
        <div id="year-table"></div>
    `);

   function loadYears() {
    $.post(royalPlugin.ajax_url, {
        action: 'scgs_get_academic_years',
        nonce: royalPlugin.nonce
    }, function (res) {

        if (!res || !res.success) {
            $('#year-table').html('<p>Error loading academic years</p>');
            return;
        }

        // ✅ Store full dataset for search/filter
        allAcademicYears = res.data;

        // ✅ Render full table initially
        renderYearsTable(allAcademicYears);
    });
}   function renderYearsTable(data) {

    let html = `
        <input type="text"
               id="year-search"
               placeholder="Search academic years..."
               style="margin-bottom:10px;width:300px">

        <table class="widefat striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (data.length === 0) {
        html += `<tr><td colspan="6">No academic years found</td></tr>`;
    } else {
        data.forEach(y => {
            html += `
                <tr>
                    <td>${y.id}</td>
                    <td>${y.name}</td>
                    <td>${y.start_date ?? '-'}</td>
                    <td>${y.end_date ?? '-'}</td>
                    <td>${y.is_active == 1 ? 'Active' : 'Inactive'}</td>
                    <td>
                        <button class="button edit-year"
                            data-id="${y.id}"
                            data-name="${y.name}"
                            data-start="${y.start_date}"
                            data-end="${y.end_date}"
                            data-active="${y.is_active}">
                            Edit
                        </button>

                        ${y.is_active == 0
                            ? `
                                <button class="button set-active" data-id="${y.id}">
                                    Set Active
                                </button>
                                <button class="button delete-year" data-id="${y.id}">
                                    Delete
                                </button>
                              `
                            : ''}
                    </td>
                </tr>
            `;
        });
    }

    html += '</tbody></table>';

    $('#year-table').html(html);
}

$(document).on('keyup', '#year-search', function () {

    const keyword = $(this).val().toLowerCase();

    const filtered = allAcademicYears.filter(y =>
        y.name.toLowerCase().includes(keyword) ||
        (y.start_date ?? '').includes(keyword) ||
        (y.end_date ?? '').includes(keyword) ||
        (y.is_active == 1 ? 'active' : 'inactive').includes(keyword)
    );

    renderYearsTable(filtered);
});



    loadYears();

    $('#year-save').on('click', function () {
        const action = editingId ? 'scgs_update_academic_year' : 'scgs_add_academic_year';

        $.post(royalPlugin.ajax_url, {
            action,
            nonce: royalPlugin.nonce,
            id: editingId,
            name: $('#year-name').val(),
            start_date: $('#year-start').val(),
            end_date: $('#year-end').val()
        }, function () {
            resetForm();
            loadYears();
        });
    });

    

    $(document).on('click', '.edit-year', function () {
        editingId = $(this).data('id');
        $('#year-name').val($(this).data('name'));
        $('#year-start').val($(this).data('start'));
        $('#year-end').val($(this).data('end'));
        $('#year-save').text('Update');
        $('#year-cancel').show();
    });

    $(document).on('click', '.set-active', function () {
        $.post(royalPlugin.ajax_url, {
            action: 'scgs_set_active_academic_year',
            nonce: royalPlugin.nonce,
            id: $(this).data('id')
        }, loadYears);
    });

    $(document).on('click', '.delete-year', function () {
        if (!confirm('Delete this academic year?')) return;

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_delete_academic_year',
            nonce: royalPlugin.nonce,
            id: $(this).data('id')
        }, function (res) {
            if (!res.success) {
                alert(res.data.message);
            }
            loadYears();
        });
    });

    $('#year-cancel').on('click', resetForm);

    function resetForm() {
        editingId = null;
        $('#year-name').val('');
        $('#year-start').val('');
        $('#year-end').val('');
        $('#year-save').text('Add');
        $('#year-cancel').hide();
    }
});
