jQuery(function ($) {

    const root = $('#scgs-subject-criteria-root');
    if (!root.length) return;

    let academicYearId = '';
    let gradeLevel = '';

    root.html(`
        <h2>Subject Criteria</h2>

        <p>
            <select id="scgs-year"></select>
            <select id="scgs-grade">
                <option value="">Select Grade</option>
            </select>
            <button class="button" id="load-criteria">Load</button>
        </p>

        <div id="criteria-table"></div>

        <p>
            <button class="button button-primary" id="save-criteria" disabled>
                Save Criteria
            </button>
        </p>
    `);

    /* ---------------- Academic Years ---------------- */

    $.post(royalPlugin.ajax_url, {
        action: 'scgs_get_academic_years',
        nonce: royalPlugin.nonce
    }, function (res) {

        let options = '';
        res.data.forEach(y => {
            options += `<option value="${y.id}" ${y.is_active == 1 ? 'selected' : ''}>
                ${y.name}
            </option>`;
        });

        $('#scgs-year').html(options);
    });

    /* ---------------- Grades ---------------- */

    $.post(royalPlugin.ajax_url, {
        action: 'scgs_get_classes',
        nonce: royalPlugin.nonce
    }, function (res) {

        const grades = [...new Set(res.data.map(c => c.grade_level))];
        grades.forEach(g => {
            $('#scgs-grade').append(`<option value="${g}">${g}</option>`);
        });
    });

    /* ---------------- Load Criteria ---------------- */

    $(document).on('click', '#load-criteria', function () {

        academicYearId = $('#scgs-year').val();
        gradeLevel = $('#scgs-grade').val();

        if (!academicYearId || !gradeLevel) {
            alert('Select academic year and grade');
            return;
        }

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_get_subject_criteria',
            nonce: royalPlugin.nonce,
            academic_year_id: academicYearId,
            grade_level: gradeLevel
        }, function (res) {

            if (!res.success) {
                alert(res.data.message);
                return;
            }

            let html = `
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Weekly %</th>
                            <th>Assessment %</th>
                            <th>Final %</th>
                            <th>Credit</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            res.data.forEach(r => {
                html += `
                    <tr data-id="${r.subject_id}">
                        <td>${r.subject_name}</td>
                        <td><input type="number" class="weekly" value="${r.weekly_weight}"></td>
                        <td><input type="number" class="assessment" value="${r.assessment_weight}"></td>
                        <td><input type="number" class="final" value="${r.final_weight}"></td>
                        <td>
                            <select class="credit">
                                <option value="credit" ${r.credit_type === 'credit' ? 'selected' : ''}>Credit</option>
                                <option value="passfail" ${r.credit_type === 'passfail' ? 'selected' : ''}>Pass/Fail</option>
                            </select>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';

            $('#criteria-table').html(html);
            $('#save-criteria').prop('disabled', false);
        });
    });

    /* ---------------- Save Criteria ---------------- */

    $(document).on('click', '#save-criteria', function () {

        if (!academicYearId || !gradeLevel) {
            alert('Please load criteria first');
            return;
        }

        const rows = [];

        $('#criteria-table tbody tr').each(function () {
            rows.push({
                subject_id: $(this).data('id'),
                weekly_weight: $(this).find('.weekly').val(),
                assessment_weight: $(this).find('.assessment').val(),
                final_weight: $(this).find('.final').val(),
                credit_type: $(this).find('.credit').val()
            });
        });

        $.post(royalPlugin.ajax_url, {
            action: 'scgs_save_subject_criteria',
            nonce: royalPlugin.nonce,
            academic_year_id: academicYearId,
            grade_level: gradeLevel,
            criteria: JSON.stringify(rows)
        }, function (res) {

            if (!res.success) {
                alert(res.data.message);
                return;
            }

            alert('Subject criteria saved successfully');
        });
    });

});
