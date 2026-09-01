'use client';

import { useEffect, useState } from 'react';
import { gqlRequest } from '@/lib/gqlRequest';
import { GET_PENDING_LISTINGS, PUBLISH_LISTING, REJECT_LISTING } from '@/graphql/admin.gql';

const REJECTION_REASONS = [
  { id: 'description', label: 'Incomplete / Misleading Description' },
  { id: 'image', label: 'Low Quality or Watermarked Images' },
  { id: 'price', label: 'Unrealistic or Incorrect Price' },
  { id: 'location', label: 'Invalid Location Details' },
  { id: 'duplicate', label: 'Duplicate Listing' },
  { id: 'tos_violation', label: 'Terms of Service Violation' },
];

export default function PendingListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await gqlRequest(GET_PENDING_LISTINGS);
      setListings(data.pendingListings || []);
    } catch (err) {
      console.error('Failed to load pending listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handlePublish = async (id: string) => {
    try {
      await gqlRequest(PUBLISH_LISTING, { id });
      // Optimistic filter out
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to publish listing');
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedListing) return;
    try {
      setSubmitting(true);
      await gqlRequest(REJECT_LISTING, {
        id: selectedListing.id,
        input: {
          reasons: selectedReasons,
          note: adminNote,
        },
      });
      setListings((prev) => prev.filter((item) => item.id !== selectedListing.id));
      setSelectedListing(null);
      setSelectedReasons([]);
      setAdminNote('');
    } catch (err) {
      alert('Failed to reject listing');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReason = (reasonId: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId) ? prev.filter((r) => r !== reasonId) : [...prev, reasonId]
    );
  };

  if (loading) return <p className="p-4">Loading queue...</p>;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Pending Review Queue ({listings.length})</h2>

      {listings.length === 0 ? (
        <div className="bg-white p-8 text-center rounded shadow text-gray-500">
          No pending listings to review.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b text-xs uppercase font-semibold text-gray-600">
                <th className="p-4">Property</th>
                <th className="p-4">Realtor</th>
                <th className="p-4">Location</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {listings.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    {item.title}
                    <div className="text-xs text-gray-400">ID: {item.property_id || item.id}</div>
                  </td>
                  <td className="p-4">
                    {item.realtor?.name || 'N/A'}
                    <div className="text-xs text-gray-400">{item.realtor?.email}</div>
                  </td>
                  <td className="p-4">{item.location ? `${item.location.city}, ${item.location.state}` : 'N/A'}</td>
                  <td className="p-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handlePublish(item.id)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => setSelectedListing(item)}
                      className="bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Reject Listing: {selectedListing.title}
            </h3>

            <p className="text-sm text-gray-600 mb-4">Select all reasons that apply:</p>

            <div className="space-y-2 mb-4">
              {REJECTION_REASONS.map((r) => (
                <label key={r.id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(r.id)}
                    onChange={() => toggleReason(r.id)}
                    className="rounded text-red-600"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>

            <textarea
              placeholder="Optional admin note to realtor..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-4 h-24 focus:ring-1 focus:ring-red-500"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedListing(null)}
                className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={submitting || selectedReasons.length === 0}
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-50 hover:bg-red-700"
              >
                {submitting ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}