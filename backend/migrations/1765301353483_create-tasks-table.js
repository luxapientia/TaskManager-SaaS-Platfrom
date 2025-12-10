'use strict';

var pgm = require('node-pg-migrate');

exports.up = pgm => {
  pgm.createTable('tasks', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: 'todo',
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    assigned_to: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
    due_date: {
      type: 'timestamp',
    },
    priority: {
      type: 'varchar(20)',
      default: 'medium',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('tasks', 'user_id');
  pgm.createIndex('tasks', 'assigned_to');
  pgm.createIndex('tasks', 'status');
  pgm.createIndex('tasks', 'due_date');
};

exports.down = pgm => {
  pgm.dropTable('tasks');
};
