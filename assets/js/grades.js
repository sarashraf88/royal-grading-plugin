jQuery(function ($) {

    const root = $('#scgs-grades-root');
    if (!root.length) return;

    console.log('Grades module loaded');

    root.html(`
        <h2>Grades Module</h2>
        <p>This page is rendering correctly.</p>
    `);

});
