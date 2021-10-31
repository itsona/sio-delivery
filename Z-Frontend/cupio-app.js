import {Router} from '@vaadin/router';
import './modules/main/view/cupio-main-view';
import './modules/admin-panel/cupio-admin-panel';
import './modules/admin-panel/cupio-admin-logs';
import './modules/delivery/cupio-delivery-view';
import './modules/delivery/cupio-delivery-details';
import './modules/new/cupio-details';
import './modules/landing/cupio-landing';
import './modules/authentication/cupio-company-registration';
import './modules/authentication/cupio-authorization';
import './modules/authentication/cupio-reset';
const outlet = document.getElementById('outlet');
const router = new Router(outlet);
router.setRoutes([
    {path: '/client', component: 'cupio-main-view'},
    {path: '/panel', component: 'cupio-delivery-view'},
    {path: '/admin', component: 'cupio-admin-panel'},
    {path: '/admin/log', component: 'cupio-admin-logs'},
    {path: '/deliveryDetails', component: 'cupio-delivery-details'},
    {path: '/delivery', component: 'cupio-delivery-view'},
    {path: '/new', component: 'cupio-details'},
    {path: '/companyDetails', component: 'cupio-company-registration'},
    {path: '/login', component: 'cupio-authorization'},
    {path: '/register', component: 'cupio-authorization'},
    {path: '/reset', component: 'cupio-reset'},
    {path: '(.*)', component: 'cupio-landing'},
]);
