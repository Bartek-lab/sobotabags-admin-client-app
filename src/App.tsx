import { BookOutlined } from "@ant-design/icons";
import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  AuthPage,
  ErrorComponent,
  useNotificationProvider,
  ThemedLayout,
  ThemedSider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";

import { AttributeCreate, AttributeEdit, AttributeList } from "./pages/attributes";
import { ProductTypeCreate, ProductTypeEdit, ProductTypeList } from "./pages/product-types";
import { CategoryCreate, CategoryEdit, CategoryList } from "./pages/categories";
import { PromotionCreate, PromotionEdit, PromotionList } from "./pages/promotions";
import { GiftCardEdit, GiftCardIssue, GiftCardList } from "./pages/gift-cards";
import { ProductCreate, ProductEdit, ProductList } from "./pages/products";
import { OrderList, OrderShow } from "./pages/orders";
import { PaymentList } from "./pages/payments";
import { ShippingMethodCreate, ShippingMethodEdit, ShippingMethodList } from "./pages/shipping-methods";
import { CustomerEdit, CustomerList } from "./pages/customers";

import { DocsPage } from "./pages/docs";

import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                dataProvider={dataProvider}
                authProvider={authProvider}
                resources={[
                  {
                    name: "products",
                    list: "/products",
                    create: "/products/create",
                    edit: "/products/edit/:id",
                    meta: { label: "Products" },
                  },
                  {
                    name: "categories",
                    list: "/categories",
                    create: "/categories/create",
                    edit: "/categories/edit/:id",
                    meta: { canDelete: true, label: "Categories" },
                  },
                  {
                    name: "product_types",
                    list: "/product-types",
                    create: "/product-types/create",
                    edit: "/product-types/edit/:id",
                    meta: { canDelete: true, label: "Product types" },
                  },
                  {
                    name: "attributes",
                    list: "/attributes",
                    create: "/attributes/create",
                    edit: "/attributes/edit/:id",
                    meta: { canDelete: true, label: "Attributes" },
                  },
                  {
                    name: "promotions",
                    list: "/promotions",
                    create: "/promotions/create",
                    edit: "/promotions/edit/:id",
                    meta: { canDelete: true, label: "Promotions" },
                  },
                  {
                    name: "gift_cards",
                    list: "/gift-cards",
                    edit: "/gift-cards/edit/:id",
                    meta: { canDelete: true, label: "Gift cards" },
                  },
                  {
                    name: "customers",
                    list: "/customers",
                    edit: "/customers/edit/:id",
                    meta: { label: "Customers" },
                  },
                  {
                    name: "orders",
                    list: "/orders",
                    show: "/orders/show/:id",
                    meta: { label: "Orders" },
                  },
                  {
                    name: "payments",
                    list: "/payments",
                    meta: { label: "Payments" },
                  },
                  {
                    name: "shipping_methods",
                    list: "/shipping-methods",
                    create: "/shipping-methods/create",
                    edit: "/shipping-methods/edit/:id",
                    meta: { canDelete: true, label: "Shipping methods" },
                  },
                  {
                    name: "docs",
                    list: "/docs",
                    meta: { label: "Documentation", icon: <BookOutlined /> },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated key="authenticated" fallback={<CatchAllNavigate to="/login" />}>
                        <ThemedLayout
                          Header={() => <Header sticky />}
                          Sider={(props) => <ThemedSider {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route index element={<NavigateToResource resource="products" />} />
                    <Route path="/products">
                      <Route index element={<ProductList />} />
                      <Route path="create" element={<ProductCreate />} />
                      <Route path="edit/:id" element={<ProductEdit />} />
                    </Route>
                    <Route path="/categories">
                      <Route index element={<CategoryList />} />
                      <Route path="create" element={<CategoryCreate />} />
                      <Route path="edit/:id" element={<CategoryEdit />} />
                    </Route>
                    <Route path="/product-types">
                      <Route index element={<ProductTypeList />} />
                      <Route path="create" element={<ProductTypeCreate />} />
                      <Route path="edit/:id" element={<ProductTypeEdit />} />
                    </Route>
                    <Route path="/attributes">
                      <Route index element={<AttributeList />} />
                      <Route path="create" element={<AttributeCreate />} />
                      <Route path="edit/:id" element={<AttributeEdit />} />
                    </Route>
                    <Route path="/promotions">
                      <Route index element={<PromotionList />} />
                      <Route path="create" element={<PromotionCreate />} />
                      <Route path="edit/:id" element={<PromotionEdit />} />
                    </Route>
                    <Route path="/gift-cards">
                      <Route index element={<GiftCardList />} />
                      <Route path="issue" element={<GiftCardIssue />} />
                      <Route path="edit/:id" element={<GiftCardEdit />} />
                    </Route>
                    <Route path="/customers">
                      <Route index element={<CustomerList />} />
                      <Route path="edit/:id" element={<CustomerEdit />} />
                    </Route>
                    <Route path="/orders">
                      <Route index element={<OrderList />} />
                      <Route path="show/:id" element={<OrderShow />} />
                    </Route>
                    <Route path="/payments">
                      <Route index element={<PaymentList />} />
                    </Route>
                    <Route path="/shipping-methods">
                      <Route index element={<ShippingMethodList />} />
                      <Route path="create" element={<ShippingMethodCreate />} />
                      <Route path="edit/:id" element={<ShippingMethodEdit />} />
                    </Route>
                    <Route path="/docs">
                      <Route index element={<DocsPage />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>

                  <Route
                    element={
                      <Authenticated key="auth-pages" fallback={<Outlet />}>
                        <NavigateToResource resource="products" />
                      </Authenticated>
                    }
                  >
                    {/* One fixed admin account, credentials set directly in the
                        DB -- no self-service registration or password reset. */}
                    <Route
                      path="/login"
                      element={<AuthPage type="login" registerLink={false} forgotPasswordLink={false} />}
                    />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
