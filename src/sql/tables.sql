CREATE TABLE Profiles (
  id SERIAL NOT NULL PRIMARY KEY,
  first_name VARCHAR(45), 
  last_name VARCHAR(45), 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE Users (
  id SERIAL NOT NULL PRIMARY KEY, 
  email VARCHAR(90) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  time_to_request_token TIMESTAMP WITH TIME ZONE,
  token_requested_count INT NOT NULL DEFAULT 0,
  profile_id INT NOT NULL,
  CONSTRAINT users_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Auth (
  id SERIAL NOT NULL PRIMARY KEY,
  change_password_token VARCHAR(64) NOT NULL,
  validation_time TIMESTAMP WITH TIME ZONE NOT NULL,
  already_used BOOLEAN NOT NULL DEFAULT FALSE,
  user_id INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT auth_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Objects (
  id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE Methods (
  id SERIAL NOT NULL PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  object_id INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT methods_object_id_fkey FOREIGN KEY (object_id) REFERENCES objects(id) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO objects (name) VALUES ('AuthService');
INSERT INTO methods (name, object_id) VALUES ('Login', 1), ('Signup', 1), ('RecoverPassword', 1), ('ResetPassword', 1);

CREATE TABLE Permissions (
  id SERIAL NOT NULL PRIMARY KEY,
  profile_id INT NOT NULL,
  method_id INT NOT NULL,
  CONSTRAINT permissions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT permissions_method_id_fkey FOREIGN KEY (method_id) REFERENCES methods(id) ON UPDATE CASCADE ON DELETE CASCADE
);
