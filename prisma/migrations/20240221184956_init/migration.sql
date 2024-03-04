-- CreateTable
CREATE TABLE `user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,
    `updated_at` DATETIME(6) NULL,
    `birth` DATE NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone_num` VARCHAR(255) NOT NULL,
    `provider` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `user_type` VARCHAR(255) NOT NULL,
    `social_uuid` VARCHAR(255) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_nickname_key`(`nickname`),
    UNIQUE INDEX `user_phone_num_key`(`phone_num`),
    INDEX `user_social_uuid_idx`(`social_uuid`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social` (
    `uuid` VARCHAR(255) NOT NULL,
    `identifier` VARCHAR(255) NULL,
    `user_uuid` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `social_user_uuid_key`(`user_uuid`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_in_channel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channel_id` CHAR(36) NOT NULL,
    `user_id` INTEGER NOT NULL,

    INDEX `member_in_channel_channel_id_fkey`(`channel_id`),
    UNIQUE INDEX `member_in_channel_user_id_channel_id_key`(`user_id`, `channel_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channel_info` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `owner_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channel_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `refresh_token` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME NULL,

    UNIQUE INDEX `channel_token_refresh_token_key`(`refresh_token`),
    UNIQUE INDEX `channel_token_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `FKhw5fuitvi0il1bgo88gu1mrbd` FOREIGN KEY (`social_uuid`) REFERENCES `social`(`uuid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `member_in_channel` ADD CONSTRAINT `member_in_channel_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channel_info`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_in_channel` ADD CONSTRAINT `member_in_channel_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `channel_info` ADD CONSTRAINT `channel_info_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
