(function () {
    'use strict';

    var app = angular.module('myApp', ['ng-admin']);

    app.controller('myCtrl', function() {});

    app.config(function(RestangularProvider, $httpProvider) {
        RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
            headers = headers || {};
            headers['Prefer'] = 'return=representation';

            if (operation === 'getList') {
                headers['Range-Unit'] = what;
                headers['Range'] = ((params._page - 1) * params._perPage) + '-' + (params._page * params._perPage - 1);
                delete params._page;
                delete params._perPage;

                if (params._sortField) {
                    params.order = 'usr_id' + '.' + params._sortDir.toLowerCase();
                    delete params._sortField;
                    delete params._sortDir;
                }
            }
        });

        RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
            switch (operation) {
                case 'get':
                    return data[0];
                case 'getList':
                    response.totalCount = response.headers('Content-Range').split('/')[1];
                    break;
            }

            return data;
        });

        // @see https://github.com/mgonto/restangular/issues/603
        $httpProvider.interceptors.push(function() {
            return {
                request: function(config) {
                    var pattern = /\/(\d+)$/;

                    if (pattern.test(config.url)) {
                        config.params = config.params || {};
                        config.params['usr_id'] = 'eq.' + pattern.exec(config.url)[1];
                        config.url = config.url.replace(pattern, '');
                    }

                    return config;
                },
            };
        });
    });

    app.config(function (NgAdminConfigurationProvider) {
        var nga = NgAdminConfigurationProvider;

        var app = nga
            .application('Ng-admin + PostgREST')
            .baseApiUrl('http://localhost:3000/');

        var js_usr = nga.entity('js_usr').identifier(nga.field('usr_id'));
        // var session = nga.entity('sessions');
        // var sponsor = nga.entity('sponsors');


        app
            .addEntity(js_usr);

        // js_usr views -------------------------------------------------------

        js_usr.menuView()
            .icon('<span class="glyphicon glyphicon-user"></span>');

        js_usr.dashboardView()
            .title('Last js_usrs')
            .fields([
                nga.field('usr_id'),
                nga.field('email_nm'),
                nga.field('crt_dt'),
            ]);

        js_usr.listView()
            .perPage(10)
            .fields([
                nga.field('usr_id'),
                nga.field('email_nm'),
                nga.field('crt_dt'),
            ])
            .listActions(['edit', 'show']);

        js_usr.showView()
            .fields([
                nga.field('usr_id'),
                nga.field('email_nm'),
                nga.field('crt_dt'),
            ]);

        js_usr.creationView()
            .fields([
                nga.field('usr_id'),
                nga.field('email_nm'),
                nga.field('crt_dt'),
            ]);

        js_usr.editionView()
            .fields(js_usr.creationView().fields());

          nga.configure(app);
    });
}());
