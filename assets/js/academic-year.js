jQuery(function ($) {

    const root = $('#scgs-academic-year-root');

    if (!root.length) {
        return;
    }

    console.log('Academic Year module loaded');

    let editingId = null;

    root.html(`
        <h2>Add / Edit Academic Year</h2>
        <p>
            <input type="text" id="year-name" placeholder="Academic Year (e.g. 2025-2026)" />
            <label style="margin-left:10px">
                <input type="checkbox" id="year-active" /> Active
            </label>
            <button type="button" class="button button-primary" id="year-save">
                Add
            </button>
            <button type="button" class="button" id="year-cancel" style="display:none">
                Cancel
            </button>
        </p>
        <hr/>
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

            let html = `
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Year</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (res.data.length === 0) {
                html += `<tr><td colspan="4">No academic years found</td></tr>`;
            } else {
                res.data.forEach(y => {
                    html += `
                        <tr>
                            <td>${y.id}</td>
                            <td>${y.name}</td>
                            <td>${y.is_active == 1 ? 'Active' : 'Inactive'}</td>
                            <td>
                                <button class="button year-edit"
                                    data-id="${y.id}"
                                    data-name="${y.name}"
                                    data-active="${y.is_active}">
                                    Edit
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            html += '</tbody></table>';
            $('#year-table').html(html);
        });
    }

    loadYears();

    $('#year-save').on('click', function () {

        const actionName = editingId
            ? 'scgs_update_academic_year'
            : 'scgs_add_academic_year';

        $.post(royalPlugin.ajax_url, {
            action: actionName,
            nonce: royalPlugin.nonce,
            id: editingId,
            name: $('#year-name').val(),
            is_active: $('#year-active').is(':checked') ? 1 : 0
        }, function () {
            resetForm();
            loadYears();
        });
    });

    $(document).on('click', '.year-edit', function () {

        editingId = $(this).data('id');

        $('#year-name').val($(this).data('name'));
        $('#year-active').prop('checked', $(this).data('active') == 1);

        $('#year-save').text('Update');
        $('#year-cancel').show();
    });

    $('#year-cancel').on('click', function () {
        resetForm();
    });

    function resetForm() {
        editingId = null;
        $('#year-name').val('');
        $('#year-active').prop('checked', false);
        $('#year-save').text('Add');
        $('#year-cancel').hide();
    }

});
