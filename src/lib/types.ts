export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_color: string;
};

export type Todo = {
  id: string;
  owner_id: string;
  title: string;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type FriendshipStatus = "pending" | "accepted" | "rejected";

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  addressee?: Profile;
};
