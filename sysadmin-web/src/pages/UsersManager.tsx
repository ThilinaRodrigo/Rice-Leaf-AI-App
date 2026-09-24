import React, { useState, useEffect } from 'react';
import { fetchAdminUsers, deleteUser, createSysAdminUser } from '../api/adminApi';
import type { User, UserRole } from '../types/admin';
import { Header } from '../components/Header';
import { Search, Trash2, UserPlus, ShieldAlert, Store, User as UserIcon, X } from 'lucide-react';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../utils/swal';

export const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Modal State for Create Admin
  const [showModal, setShowModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete User Account?',
      text: `Are you sure you want to delete user "${name}"? This action cannot be undone.`,
      confirmButtonText: 'Yes, Delete User',
      cancelButtonText: 'Cancel',
      icon: 'warning',
    });
    if (!confirmed) return;

    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      showSuccessToast('User account deleted successfully');
    } catch (err: any) {
      showErrorAlert('Delete Failed', err.response?.data?.error || err.message || 'Failed deleting user account.');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPassword) {
      setModalError('Please fill in all fields.');
      return;
    }

    const confirmed = await showConfirmDialog({
      title: 'Create System Administrator?',
      text: `Are you sure you want to create a new SysAdmin account for "${adminName}" (${adminEmail})?`,
      confirmButtonText: 'Yes, Create Admin',
      cancelButtonText: 'Cancel',
      icon: 'question',
    });
    if (!confirmed) return;

    setModalError('');
    setModalSubmitting(true);
    try {
      await createSysAdminUser({
        full_name: adminName,
        email: adminEmail,
        password: adminPassword,
      });
      setShowModal(false);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      loadUsers();
      showSuccessToast('System Administrator created successfully');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed creating SysAdmin';
      setModalError(msg);
      showErrorAlert('Creation Failed', msg);
    } finally {
      setModalSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.nic?.toLowerCase().includes(search.toLowerCase()) ||
      u.district?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'sys_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Sys Admin</span>
          </span>
        );
      case 'shop_owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Store className="w-3.5 h-3.5" />
            <span>Shop Owner</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <UserIcon className="w-3.5 h-3.5" />
            <span>Farmer</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="User Management"
        subtitle="View, search, and manage registered Farmers, Shop Owners, and System Administrators"
        onRefresh={loadUsers}
      />

      <div className="p-8 space-y-6">
        {/* Actions & Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, NIC, district..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="shop_owner">Shop Owners</option>
              <option value="sys_admin">System Admins</option>
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-purple-600/25 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create SysAdmin</span>
          </button>
        </div>

        {/* Users Data Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">User Info</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">NIC / Identity</th>
                  <th className="p-3.5">District / Shop</th>
                  <th className="p-3.5">Joined Date</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-white">{u.full_name}</p>
                        <p className="text-xs text-slate-400">{u.email || 'No email'}</p>
                      </td>
                      <td className="p-3.5">{getRoleBadge(u.role)}</td>
                      <td className="p-3.5 font-mono text-xs text-slate-300">
                        {u.nic || 'N/A'}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {u.role === 'shop_owner' && u.shop_name ? (
                          <span className="font-semibold text-amber-400">{u.shop_name}</span>
                        ) : (
                          u.district || 'N/A'
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400 text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDelete(u.id, u.full_name)}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No users found matching your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create SysAdmin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-1">Create System Administrator</h3>
            <p className="text-xs text-slate-400 mb-6">
              Add a new SysAdmin account with full management privileges.
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="System Administrator Name"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin.sec@riceleaf.lk"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-purple-600/25 transition-all"
                >
                  {modalSubmitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
