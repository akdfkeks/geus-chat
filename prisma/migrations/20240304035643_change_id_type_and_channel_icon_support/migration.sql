/*
Warnings:

- The primary key for the `channel_info` table will be changed. If it partially fails, the table could be left without primary key constraint.
- You are about to alter the column `id` on the `channel_info` table. The data in that column could be lost. The data in that column will be cast from `Char(36)` to `UnsignedBigInt`.
- You are about to alter the column `created_at` on the `channel_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
- You are about to alter the column `expires_at` on the `channel_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
- You are about to alter the column `channel_id` on the `member_in_channel` table. The data in that column could be lost. The data in that column will be cast from `Char(36)` to `UnsignedBigInt`.
- The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
- You are about to drop the column `user_id` on the `user` table. All the data in the column will be lost.
- Added the required column `id` to the `user` table without a default value. This is not possible if the table is not empty.

 */
-- DropForeignKey
ALTER TABLE `channel_info`
DROP FOREIGN KEY `channel_info_owner_id_fkey`;

-- DropForeignKey
ALTER TABLE `member_in_channel`
DROP FOREIGN KEY `member_in_channel_channel_id_fkey`;

-- DropForeignKey
ALTER TABLE `member_in_channel`
DROP FOREIGN KEY `member_in_channel_user_id_fkey`;

-- AlterTable
ALTER TABLE `channel_info`
DROP PRIMARY KEY,
ADD COLUMN `icon_url` VARCHAR(2047) NULL,
MODIFY `id` BIGINT UNSIGNED NOT NULL,
MODIFY `owner_id` BIGINT NOT NULL,
ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `member_in_channel` MODIFY `channel_id` BIGINT UNSIGNED NOT NULL,
MODIFY `user_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `user`
DROP PRIMARY KEY,
DROP COLUMN `user_id`,
ADD COLUMN `id` BIGINT NOT NULL,
ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `member_in_channel` ADD CONSTRAINT `member_in_channel_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `channel_info` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_in_channel` ADD CONSTRAINT `member_in_channel_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `channel_info` ADD CONSTRAINT `channel_info_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;