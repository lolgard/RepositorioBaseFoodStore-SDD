import { useSearchParams, Link } from 'react-router-dom';

const FEEDBACK_CONFIG: Record<string, { title: string; description: string; icon: string; color: string }> = {
  success: {
    title: 'Payment Successful!',
    description: 'Your payment has been processed successfully.',
    icon: '✅',
    color: 'text-green-600',
  },
  failure: {
    title: 'Payment Failed',
    description: 'There was a problem processing your payment. Please try again.',
    icon: '❌',
    color: 'text-red-600',
  },
  pending: {
    title: 'Payment Pending',
    description: 'Your payment is being processed. We\'ll notify you when it\'s confirmed.',
    icon: '⏳',
    color: 'text-yellow-600',
  },
};

export default function PaymentFeedbackPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'pending';
  const externalRef = searchParams.get('external_reference');
  const config = FEEDBACK_CONFIG[status] || FEEDBACK_CONFIG.pending;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className={`text-5xl mb-4 ${config.color}`}>{config.icon}</div>
        <h1 className={`text-2xl font-bold mb-2 ${config.color}`}>{config.title}</h1>
        <p className="text-gray-600 mb-6">{config.description}</p>

        {externalRef && (
          <p className="text-sm text-gray-500 mb-6">
            Order reference: #{externalRef}
          </p>
        )}

        <div className="space-x-4">
          {externalRef ? (
            <Link
              to={`/orders/${externalRef}`}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Order
            </Link>
          ) : (
            <Link
              to="/orders"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              My Orders
            </Link>
          )}
          <Link
            to="/"
            className="inline-block bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
