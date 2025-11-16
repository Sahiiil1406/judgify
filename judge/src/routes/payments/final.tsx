import React from 'react';
import { AutumnProvider, useCustomer, CheckoutDialog, PricingTable } from 'autumn-js/react';
import { CreditCard, Sparkles, Check, Zap } from 'lucide-react';

// Main App Component with AutumnProvider
const PaymentApp = () => {
  return (
    <AutumnProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <PaymentComponent />
      </div>
    </AutumnProvider>
  );
};

// Payment Component using Autumn.js hooks and components
const PaymentComponent = () => {
  const { customer, checkout, openBillingPortal, cancel } = useCustomer();

  // Handle checkout with Autumn's CheckoutDialog
  const handleUpgrade = async (productId) => {
    try {
      await checkout({
        productId: productId,
        dialog: CheckoutDialog, // Built-in Autumn dialog component
      });
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  // Open billing portal for payment management
  const handleManageBilling = async () => {
    try {
      await openBillingPortal({
        returnUrl: window.location.href,
      });
    } catch (error) {
      console.error('Billing portal error:', error);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async (productId) => {
    try {
      await cancel({
        productId: productId,
      });
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-6 shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600">
          Powered by Autumn.js - Simple, Secure Billing
        </p>
      </div>

      {/* Customer Info Display */}
      {customer && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Your Account
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium">{customer.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Customer ID:</span>
              <p className="font-mono text-xs">{customer.id}</p>
            </div>
          </div>
          
          <button
            onClick={handleManageBilling}
            className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition-colors font-medium"
          >
            Manage Billing & Payment Methods
          </button>
        </div>
      )}

      {/* Option 1: Use Autumn's Built-in PricingTable Component */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Option 1: Autumn PricingTable Component
        </h2>
        <PricingTable />
      </div>

      {/* Option 2: Custom Pricing Cards with Autumn Checkout */}
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Option 2: Custom Pricing with Autumn Hooks
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-purple-300 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">10 messages per month</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Basic support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Community access</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 border-2 border-purple-500 transform scale-105 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-purple-100 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-300 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-white">500 messages per month</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-300 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-white">Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-300 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-white">Advanced features</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-300 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-white">API access</span>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade('pro')}
              className="w-full bg-white text-purple-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-300 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-5xl font-bold text-gray-900">$99</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Unlimited messages</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Dedicated support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Custom integrations</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">SLA guarantee</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Team training</span>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade('enterprise')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Why Choose Autumn.js?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Lightning Fast</h4>
            <p className="text-gray-600 text-sm">
              Simple integration with built-in components
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Secure Payments</h4>
            <p className="text-gray-600 text-sm">
              Built on top of Stripe for maximum security
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">No Webhooks</h4>
            <p className="text-gray-600 text-sm">
              Query Autumn for data - no complex webhook handling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentApp;