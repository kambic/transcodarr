from django.test import TestCase
from django.urls import reverse


class DemoViewTests(TestCase):
    def test_demo_view_loads_successfully(self):
        url = reverse("dashboard:demo")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "demo.html")

    def test_index_view_loads_demo_template(self):
        url = reverse("dashboard:index")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "demo.html")

    def test_demo_view_contains_flowbite_components(self):
        response = self.client.get(reverse("dashboard:demo"))
        self.assertContains(response, "Flowbite Component Placeholders")
        self.assertContains(response, 'data-accordion="collapse"')
        self.assertContains(response, 'data-tabs-toggle="#default-tab-content"')
        self.assertContains(response, 'data-modal-toggle="default-modal"')
        self.assertContains(response, 'data-dropdown-toggle="dropdown"')
        self.assertContains(response, 'data-drawer-show="drawer-example"')
        self.assertContains(response, 'data-input-counter')
        self.assertContains(response, "default-datepicker")
        self.assertContains(response, 'data-popover-target="popover-default"')
        self.assertContains(response, 'data-tooltip-target="tooltip-default"')
        self.assertContains(response, 'data-dial-init')
        self.assertContains(response, 'data-dismiss-target="#alert-1"')
        self.assertContains(response, 'data-carousel="slide"')
