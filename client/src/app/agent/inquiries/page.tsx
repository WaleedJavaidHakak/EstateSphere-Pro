// app/agent/inquiries/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Clock, Eye, CheckCircle2, AlertCircle, Reply, Send, CheckCheck, MessageCircle, X, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import api from '@/lib/axios';

// Types
interface Reply {
  _id?: string;
  message: string;
  repliedBy: { _id: string; name: string; role: string };
  repliedByName: string;
  repliedByRole: string;
  createdAt: string;
}

interface Inquiry {
  _id: string;
  property: {
    _id: string;
    title: string;
    images: string[];
    location?: any;
    price?: number;
  };
  user?: { _id: string; name: string; email: string };
  agent?: { _id: string; name: string; email: string; avatar?: string };
  agentName?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'closed';
  replies?: Reply[];
  createdAt: string;
  updatedAt: string;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const id = localStorage.getItem('userId');
    setUserRole(role);
    setUserId(id);
    
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view inquiries');
        return;
      }
      
      if (role === 'agent' || role === 'admin') {
        response = await api.get('/inquiries');
      } else {
        response = await api.get('/inquiries/my');
      }
      
      setInquiries(response.data.inquiries || []);
    } catch (err: any) {
      console.error('Failed to fetch inquiries:', err);
      if (err.response?.status === 401) {
        setError('Please login to view inquiries');
      } else {
        setError(err.response?.data?.message || 'Failed to load inquiries');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    
    // Auto-mark as read when opening (only for agents/admins and only if status is pending)
    if ((userRole === 'agent' || userRole === 'admin') && inquiry.status === 'pending') {
      await markAsRead(inquiry._id);
    }
  };

  const markAsRead = async (inquiryId: string) => {
    try {
      setMarkingAsRead(inquiryId);
      await api.put(`/inquiries/${inquiryId}/read`);
      
      // Update local state
      setInquiries(prev => prev.map(inquiry => 
        inquiry._id === inquiryId ? { ...inquiry, status: 'read' as const } : inquiry
      ));
      
      if (selectedInquiry?._id === inquiryId) {
        setSelectedInquiry(prev => prev ? { ...prev, status: 'read' as const } : null);
      }
    } catch (err: any) {
      console.error('Failed to mark as read:', err);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleStatusUpdate = async (inquiryId: string, newStatus: string, closeModal = false) => {
    // Check permissions
    if (userRole !== 'agent' && userRole !== 'admin') {
      alert('You do not have permission to update status');
      return;
    }

    // Only admin can close
    if (newStatus === 'closed' && userRole !== 'admin') {
      alert('Only admin can close inquiries');
      return;
    }
    
    try {
      setUpdatingStatus(inquiryId);
      await api.put(`/inquiries/${inquiryId}`, { status: newStatus });
      
      // Update local state
      setInquiries(prev => prev.map(inquiry => 
        inquiry._id === inquiryId ? { ...inquiry, status: newStatus as any } : inquiry
      ));
      
      if (selectedInquiry?._id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus as any });
      }
      
      alert(`Status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
      if (closeModal) {
        setSelectedInquiry(null);
      }
    }
  };

  const handleSendPlatformReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }
    
    if (!selectedInquiry) return;
    
    if (userRole !== 'agent' && userRole !== 'admin') {
      alert('You do not have permission to reply');
      return;
    }
    
    try {
      setSendingReply(true);
      
      const response = await api.post(`/inquiries/${selectedInquiry._id}/reply`, {
        message: replyText
      });
      
      if (response.data.success) {
        alert('Reply sent successfully!');
        setReplyText('');
        
        // Refresh inquiries
        await fetchInquiries();
        
        // If the modal is open, refresh selected inquiry
        const updatedInquiry = inquiries.find(i => i._id === selectedInquiry._id);
        if (updatedInquiry) {
          setSelectedInquiry({
            ...updatedInquiry,
            status: 'replied' as const
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to add reply:', err);
      alert(err.response?.data?.message || 'Failed to add reply');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      read: 'bg-blue-100 text-blue-800 border-blue-200',
      replied: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    const icons: Record<string, React.ReactNode> = {
      pending: <AlertCircle className="w-3 h-3" />,
      read: <Eye className="w-3 h-3" />,
      replied: <CheckCircle2 className="w-3 h-3" />,
      closed: <CheckCheck className="w-3 h-3" />,
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getValidImageSrc = (images: string[] | undefined): string | null => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return null;
    }
    const firstImage = images[0];
    // Check if it's a valid non-empty string
    if (firstImage && typeof firstImage === 'string' && firstImage.trim() !== '') {
      return firstImage;
    }
    return null;
  };

  const canReply = () => {
    return userRole === 'agent' || userRole === 'admin';
  };

  const canClose = () => {
    return userRole === 'admin';
  };

  const canUpdateStatus = () => {
    return userRole === 'agent' || userRole === 'admin';
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white min-h-screen">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchInquiries}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {userRole === 'agent' || userRole === 'admin' ? 'Inquiries Received' : 'My Inquiries'}
        </h1>
        <p className="text-gray-600 mt-1">
          {userRole === 'agent' || userRole === 'admin' 
            ? 'View and respond to client inquiries for your properties.'
            : 'Track your property inquiries and responses.'}
        </p>
      </div>

      {inquiries.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {userRole === 'agent' || userRole === 'admin' ? 'No Inquiries Yet' : 'No Inquiries Sent'}
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            {userRole === 'agent' || userRole === 'admin'
              ? 'When clients send messages about your properties, they will appear here.'
              : 'When you inquire about properties, they will appear here.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {inquiries.map((inquiry) => {
            const validImageSrc = getValidImageSrc(inquiry.property?.images);
            const replyCount = inquiry.replies?.length || 0;
            
            return (
              <motion.div
                key={inquiry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border rounded-xl p-5 hover:shadow-md transition cursor-pointer ${
                  inquiry.status === 'pending' && (userRole === 'agent' || userRole === 'admin') 
                    ? 'border-yellow-300 bg-yellow-50/30' 
                    : 'border-gray-200'
                }`}
                onClick={() => handleSelectInquiry(inquiry)}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      {validImageSrc && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <Image 
                            src={validImageSrc} 
                            alt={inquiry.property?.title || 'Property'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              // Hide image on error
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      {!validImageSrc && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{inquiry.property?.title || 'Property'}</h3>
                        {inquiry.property?.price && (
                          <p className="text-sm font-medium text-primary mt-1">{formatPrice(inquiry.property.price)}</p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3 line-clamp-2">
                      <span className="font-medium">Message:</span> {inquiry.message}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail className="w-3.5 h-3.5" /> 
                        {userRole === 'agent' || userRole === 'admin' ? inquiry.email : inquiry.agent?.email || 'N/A'}
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-3.5 h-3.5" /> {inquiry.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-3.5 h-3.5" /> 
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </div>
                      {replyCount > 0 && (
                        <div className="flex items-center gap-1 text-green-600">
                          <MessageCircle className="w-3.5 h-3.5" /> {replyCount} repl{replyCount === 1 ? 'y' : 'ies'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {markingAsRead === inquiry._id ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      getStatusBadge(inquiry.status)
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedInquiry(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
                <p className="text-sm text-gray-600">Property: {selectedInquiry.property?.title}</p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Inquiry Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium">{selectedInquiry.name}</p>
                  <p className="text-sm">{selectedInquiry.email}</p>
                  {selectedInquiry.phone && <p className="text-sm">{selectedInquiry.phone}</p>}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedInquiry.status)}
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Original Message</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Replies Section */}
              {selectedInquiry.replies && selectedInquiry.replies.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Conversation ({selectedInquiry.replies.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedInquiry.replies.map((reply, index) => (
                      <div key={reply._id || index} className="bg-blue-50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {reply.repliedByName || (reply.repliedBy?.name || 'System')}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
                              {reply.repliedByRole === 'admin' ? 'Admin' : reply.repliedByRole === 'agent' ? 'Agent' : 'Staff'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form (for agents/admins) */}
              {canReply() && selectedInquiry.status !== 'closed' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Your Reply</h3>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button
                    onClick={handleSendPlatformReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="mt-3 px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition"
                  >
                    {sendingReply ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Status Update Section */}
              {canUpdateStatus() && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedInquiry._id, 'pending', false)}
                      disabled={selectedInquiry.status === 'pending' || updatingStatus === selectedInquiry._id}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        selectedInquiry.status === 'pending'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedInquiry._id, 'read', false)}
                      disabled={selectedInquiry.status === 'read' || updatingStatus === selectedInquiry._id}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        selectedInquiry.status === 'read'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Read
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedInquiry._id, 'replied', false)}
                      disabled={selectedInquiry.status === 'replied' || updatingStatus === selectedInquiry._id}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        selectedInquiry.status === 'replied'
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Replied
                    </button>
                    {canClose() && (
                      <button
                        onClick={() => handleStatusUpdate(selectedInquiry._id, 'closed', false)}
                        disabled={selectedInquiry.status === 'closed' || updatingStatus === selectedInquiry._id}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          selectedInquiry.status === 'closed'
                            ? 'bg-gray-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        Closed
                      </button>
                    )}
                  </div>
                  {!canClose() && (
                    <p className="text-xs text-gray-500 mt-2">Note: Only admin can mark an inquiry as Closed</p>
                  )}
                  {updatingStatus === selectedInquiry._id && (
                    <div className="text-sm text-gray-500 mt-2">Updating status...</div>
                  )}
                </div>
              )}

              {/* For clients viewing their inquiry - show status info */}
              {userRole === 'user' && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Current Status:</span> {selectedInquiry.status}
                  </p>
                  {selectedInquiry.status === 'pending' && (
                    <p className="text-sm text-yellow-600 mt-1">The agent has not yet read your inquiry.</p>
                  )}
                  {selectedInquiry.status === 'read' && (
                    <p className="text-sm text-blue-600 mt-1">The agent has read your inquiry and will respond soon.</p>
                  )}
                  {selectedInquiry.status === 'replied' && (
                    <p className="text-sm text-green-600 mt-1">The agent has responded to your inquiry. Check the conversation above!</p>
                  )}
                  {selectedInquiry.status === 'closed' && (
                    <p className="text-sm text-gray-600 mt-1">This inquiry has been closed.</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}