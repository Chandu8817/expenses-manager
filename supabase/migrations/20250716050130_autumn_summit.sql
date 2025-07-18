/*
  # Financial Manager Database Schema

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `category` (text)
      - `amount` (decimal)
      - `date` (date)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `lend_borrow_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `person` (text)
      - `amount` (decimal)
      - `type` (text, 'lent' or 'borrowed')
      - `date` (date)
      - `due_date` (date, optional)
      - `description` (text)
      - `status` (text, 'pending' or 'completed')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  amount decimal(10,2) NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lend_borrow_records table
CREATE TABLE IF NOT EXISTS lend_borrow_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person text NOT NULL,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('lent', 'borrowed')),
  date date NOT NULL,
  due_date date,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lend_borrow_records ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Users can read own expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for lend_borrow_records
CREATE POLICY "Users can read own lend_borrow_records"
  ON lend_borrow_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lend_borrow_records"
  ON lend_borrow_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lend_borrow_records"
  ON lend_borrow_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lend_borrow_records"
  ON lend_borrow_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);

CREATE INDEX IF NOT EXISTS lend_borrow_records_user_id_idx ON lend_borrow_records(user_id);
CREATE INDEX IF NOT EXISTS lend_borrow_records_date_idx ON lend_borrow_records(date DESC);
CREATE INDEX IF NOT EXISTS lend_borrow_records_status_idx ON lend_borrow_records(status);
CREATE INDEX IF NOT EXISTS lend_borrow_records_type_idx ON lend_borrow_records(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS ₹₹
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
₹₹ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lend_borrow_records_updated_at
  BEFORE UPDATE ON lend_borrow_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();