
'use client';

import { useEffect, useState } from 'react';
import { inquiryService, Inquiry } from '@/services/inquiryService';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, AlertCircle } from 'lucide-react';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setError(null);
      const data = await inquiryService.getMyInquiries();
      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error('Error fetching inquiries', err);
      setError('Failed to load your inquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries =
    filter === 'all'
      ? inquiries
      : inquiries.filter((inq) => inq.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'read':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'replied':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Inquiries</h1>
        <p className="text-muted-foreground mt-1">
          Messages and inquiries from interested buyers.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-3 flex-wrap">
        {['all', 'pending', 'read', 'replied', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-card text-foreground border border-border hover:bg-muted'
            }`}
          >
            {status === 'all' ? 'All Inquiries' : status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredInquiries.length > 0 ? (
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry._id}
              className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">
                      {inquiry.name}
                    </h3>

                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap flex-shrink-0 ${getStatusColor(inquiry.status)}`}
                    >
                      {inquiry.status}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2 truncate">
                    {inquiry.property?.title || 'Property'}
                  </p>

                  <p className="text-sm text-foreground line-clamp-2 mb-3">
                    {inquiry.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {inquiry.email}
                    </span>

                    {inquiry.phone && <span>{inquiry.phone}</span>}

                    <span>
                      {formatDistanceToNow(new Date(inquiry.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {inquiry.agent && (
                    <div className="text-xs bg-muted rounded px-2 py-1 inline-block">
                      <span className="text-muted-foreground">
                        Agent:{' '}
                      </span>
                      <span className="font-medium">
                        {inquiry.agent}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />

          <h3 className="text-xl font-bold mb-2">
            No inquiries yet
          </h3>

          <p className="text-muted-foreground">
            {filter !== 'all'
              ? 'No inquiries with this status'
              : "You haven't received any inquiries about your properties yet."}
          </p>
        </div>
      )}
    </div>
  );
}
