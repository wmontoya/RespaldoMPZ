from odoo import models, fields, api
import json
import base64
from smbprotocol.connection import Connection, Dialects
from smbprotocol.open import Open, CreateDisposition, CreateOptions, FileAttributes, FilePipePrinterAccessMask, ImpersonationLevel, ShareAccess
from smbprotocol.session import Session
from smbprotocol.tree import TreeConnect
import uuid
from datetime import datetime
import os
import io

class Imagen(models.Model):
    _name = "parking_meters.image"
    _description = "Images"

    id = fields.Integer(string="Id", readonly=True)
    route = fields.Char(string="Ruta")
    infraction_code_id = fields.Many2one("parking_meters.infraction", string="Infraction", ondelete="cascade")

    servers = [
        ("172.19.20.80", "Tramites"),
        ("172.19.0.67", "MPZStoreOnceTramites")
    ]

    def _connect_smb(self, server, share_name):
        config_param = self.env['ir.config_parameter'].sudo()
        username = f"MPZ\\{config_param.get_param('tramites.User')}"
        password = config_param.get_param('tramites.Password')

        dialect = None        
        try:
            connection = Connection(uuid.uuid4(), server, 445)
            if(server == self.servers[0][0]):
                dialect = Dialects.SMB_3_1_1
            elif(server == self.servers[1][0]):
                dialect = Dialects.SMB_2_1_0
            connection.connect(dialect)
            session = Session(connection, username, password, False)
            session.connect()
            tree = TreeConnect(session, f"\\\\{server}\\{share_name}")
            tree.connect()
            return connection, session, tree
        except Exception as e:
            print(f"[SMB CONNECT ERROR] {server} with {dialect} - {e}", flush=True)
            pass

        return None, None, None

    def _disconnect_smb(self, connection, session, tree):
        try:
            if tree:
                tree.disconnect()
        except Exception:
            pass
        try:
            if session:
                session.disconnect()
        except Exception:
            pass
        try:
            if connection:
                connection.disconnect()
        except Exception:
            pass

    def _get_image_from_server(self, tree, file_path, chunk_size=64 * 1024):
        file_open = None
        try:
            # Normalizar a backslashes primero
            candidate_paths = [
                file_path.replace("/", "\\"),
                file_path.replace("\\", "/"),
            ]

            for candidate in candidate_paths:
                try:
                    file_open = Open(tree, candidate)
                    file_open.create(
                        ImpersonationLevel.Impersonation,
                        FilePipePrinterAccessMask.FILE_READ_DATA,
                        FileAttributes.FILE_ATTRIBUTE_NORMAL,
                        ShareAccess.FILE_SHARE_READ,
                        CreateDisposition.FILE_OPEN,
                        CreateOptions.FILE_NON_DIRECTORY_FILE,
                    )

                    leftover = b""
                    offset = 0
                    total_size = getattr(file_open, "end_of_file", 0)
                    b64_writer = io.StringIO()

                    while offset < total_size:
                        to_read = min(chunk_size, total_size - offset)
                        chunk = file_open.read(offset, to_read)
                        if not chunk:
                            break

                        data = leftover + (chunk if isinstance(chunk, (bytes, bytearray)) else bytes(chunk))
                        enc_len = (len(data) // 3) * 3

                        if enc_len > 0:
                            to_encode = data[:enc_len]
                            encoded = base64.b64encode(to_encode).decode("utf-8")
                            b64_writer.write(encoded)
                            leftover = data[enc_len:]
                        else:
                            leftover = data

                        offset += len(chunk)
                    if leftover:
                        b64_writer.write(base64.b64encode(leftover).decode("utf-8"))

                    result = b64_writer.getvalue()
                    b64_writer.close()
                    file_open.close()

                    return result if result else None

                except Exception as e:
                    if "STATUS_OBJECT_PATH_NOT_FOUND" in str(e):
                        continue
                    else:
                        print(f"[SMB READ ERROR] {candidate} - {e}", flush=True)
                        return None

            return None

        finally:
            if file_open:
                try:
                    file_open.close()
                except Exception:
                    pass

    @api.model
    def get_image(self, **kwargs):
        max_images =  5
        images_data = []

        images = self.search([('infraction_code_id', '=', kwargs.get("id_infraction"))], limit=max_images)
        for image in images:
            for server, share_name in self.servers:
                conn, sess, tree = self._connect_smb(server, share_name)
                if not tree:
                    self._disconnect_smb(conn, sess, tree)
                    continue

                try:
                    image_data = self._get_image_from_server(tree, image.route)
                    if image_data:
                        images_data.append(image_data)
                finally:
                    self._disconnect_smb(conn, sess, tree)
                if len(images_data) >= max_images:
                    break
            if len(images_data) >= max_images:
                break

        if not images_data:
            config_param = self.env["ir.config_parameter"].sudo()
            path = config_param.get_param("parking_meters.Image_folder")
            current_date = kwargs.get("registration_date", datetime.now())
            ticket_number = kwargs.get("ticket_number", "")

            for server, share_name in self.servers:
                conn, sess, tree = self._connect_smb(server, share_name)
                if not tree:
                    self._disconnect_smb(conn, sess, tree)
                    continue

                try:
                    for i in range(max_images):
                        file_name = f"{ticket_number}-{i}.jpg"
                        directory_path = f"{path}\\{current_date.year}\\{current_date.month}\\{current_date.day}\\{ticket_number}"
                        file_path = f"{directory_path}\\{file_name}"
                        image_data = self._get_image_from_server(tree, file_path)
                        if image_data:
                            images_data.append(image_data)
                        if len(images_data) >= max_images:
                            break
                finally:
                    self._disconnect_smb(conn, sess, tree)

                if images_data:
                    break

            if not images_data:
                return json.dumps({'success': False, 'error': 'Images not found'})

        return json.dumps(images_data)

    def save_images(self, image_data, ticket_number, idInfraction):
        config_param = self.env["ir.config_parameter"].sudo()
        path = config_param.get_param("parking_meters.Image_folder")

        for server, share_name in self.servers:
            conn, sess, tree = self._connect_smb(server, share_name)
            if not tree:
                self._disconnect_smb(conn, sess, tree)
                continue

            current_date = datetime.now()
            success = False

            try:
                for index, item in enumerate(image_data):
                    try:
                        base64_string = item.get("base64")
                        image_bytes = base64.b64decode(base64_string)
                        file_name = f"{ticket_number}-{index}.jpg"
                        directory_path = f"{path}\\{current_date.year}\\{current_date.month}\\{current_date.day}\\{ticket_number}"
                        file_path = f"{directory_path}\\{file_name}"

                        self.ensure_directory_exists(tree, directory_path)

                        file_open = Open(tree, file_path)
                        file_open.create(
                            ImpersonationLevel.Impersonation,
                            FilePipePrinterAccessMask.FILE_WRITE_DATA,
                            FileAttributes.FILE_ATTRIBUTE_NORMAL,
                            ShareAccess.FILE_SHARE_READ,
                            CreateDisposition.FILE_OVERWRITE_IF,
                            CreateOptions.FILE_NON_DIRECTORY_FILE,
                        )
                        file_open.write(image_bytes, 0, False, False)
                        file_open.close()

                        self.env["parking_meters.image"].create({"route": file_path, "infraction_code_id": idInfraction})
                        success = True

                    except Exception as e:
                        print(f"Error al escribir en {server}: {e}", flush=True)
            finally:
                self._disconnect_smb(conn, sess, tree)

            if success:
                return

        raise Exception("Failed to save images to all provided servers.")

    def ensure_directory_exists(self, tree, directory_path):
        parts = directory_path.split("\\")
        current_path = ""
        for part in parts:
            if not part:
                continue
            current_path = os.path.join(current_path, part)
            current_path = current_path.replace("/", "\\")
            try:
                file_open = Open(tree, current_path)
                file_open.create(
                    ImpersonationLevel.Impersonation,
                    FilePipePrinterAccessMask.FILE_WRITE_DATA,
                    FileAttributes.FILE_ATTRIBUTE_DIRECTORY,
                    ShareAccess.FILE_SHARE_READ,
                    CreateDisposition.FILE_OPEN_IF,
                    CreateOptions.FILE_DIRECTORY_FILE,
                )
                file_open.close()
            except Exception as e:
                if "STATUS_OBJECT_PATH_NOT_FOUND" in str(e) or "STATUS_OBJECT_NAME_INVALID" in str(e):
                    self.create_directory(tree, current_path)
                else:
                    print(f"Error creando directorio {current_path}: {e}", flush=True)

    def create_directory(self, tree, directory_path):
        file_open = Open(tree, directory_path)
        file_open.create(
            ImpersonationLevel.Impersonation,
            FilePipePrinterAccessMask.FILE_WRITE_DATA,
            FileAttributes.FILE_ATTRIBUTE_DIRECTORY,
            ShareAccess.FILE_SHARE_READ,
            CreateDisposition.FILE_CREATE,
            CreateOptions.FILE_DIRECTORY_FILE,
        )
        file_open.close()