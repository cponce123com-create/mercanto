import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Categories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";
import StoreDetail from "./pages/StoreDetail";
import Stores from "./pages/Stores";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProducts from "./pages/VendorProducts";
import VendorStoreSettings from "./pages/VendorStoreSettings";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      <Route path="/search" component={Search} />

      <Route path="/categories" component={Categories} />
      <Route path="/categorias" component={Categories} />

      <Route path="/stores" component={Stores} />
      <Route path="/tiendas" component={Stores} />

      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/producto/:slug" component={ProductDetail} />

      <Route path="/store/:slug" component={StoreDetail} />
      <Route path="/tienda/:slug" component={StoreDetail} />

      <Route path="/vendor" component={VendorDashboard} />
      <Route path="/panel-vendedor" component={VendorDashboard} />

      <Route path="/vendor/products" component={VendorProducts} />
      <Route path="/panel-vendedor/productos" component={VendorProducts} />

      <Route path="/vendor/store" component={VendorStoreSettings} />
      <Route path="/panel-vendedor/tienda" component={VendorStoreSettings} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
