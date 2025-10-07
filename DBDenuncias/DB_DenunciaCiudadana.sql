-- 1) (Opcional) Crear base de datos
IF DB_ID('DenunciaCiudadanaDB') IS NULL
    CREATE DATABASE DenunciaCiudadanaDB;
GO
USE DenunciaCiudadanaDB;
GO

-- Por orden: tablas maestras -> transaccionales

IF OBJECT_ID('dbo.Ciudadano') IS NOT NULL DROP TABLE dbo.Ciudadano;
GO
CREATE TABLE dbo.Ciudadano (
    IdCiudadano     INT IDENTITY(1,1) CONSTRAINT PK_Ciudadano PRIMARY KEY,
    Nombres         NVARCHAR(100)    NOT NULL,
    Apellidos       NVARCHAR(100)    NOT NULL,
    DNI             VARCHAR(12)      NOT NULL,
    Correo          NVARCHAR(150)    NULL,
    Telefono        NVARCHAR(30)     NULL,
    FechaRegistro   DATETIME2(0)     NOT NULL CONSTRAINT DF_Ciudadano_FechaRegistro DEFAULT (SYSUTCDATETIME())
);
-- DNI único
CREATE UNIQUE INDEX UX_Ciudadano_DNI ON dbo.Ciudadano(DNI);

-- (Opcional) correo único si lo deseas
--CREATE UNIQUE INDEX UX_Ciudadano_Correo ON dbo.Ciudadano(Correo) WHERE Correo IS NOT NULL;

IF OBJECT_ID('dbo.Autoridad') IS NOT NULL DROP TABLE dbo.Autoridad;
GO
CREATE TABLE dbo.Autoridad (
    IdAutoridad     INT IDENTITY(1,1) CONSTRAINT PK_Autoridad PRIMARY KEY,
    Nombres         NVARCHAR(100)   NOT NULL,
    Apellidos       NVARCHAR(100)   NOT NULL,
    Cargo           NVARCHAR(100)   NULL,
    Correo          NVARCHAR(150)   NULL,
    Telefono        NVARCHAR(30)    NULL,
    FechaRegistro   DATETIME2(0)    NOT NULL CONSTRAINT DF_Autoridad_FechaRegistro DEFAULT (SYSUTCDATETIME())
);
/* =======================
   Tabla: TipoIncidencia
   =======================*/
IF OBJECT_ID('dbo.TipoIncidencia') IS NOT NULL DROP TABLE dbo.TipoIncidencia;
GO
CREATE TABLE dbo.TipoIncidencia (
    IdTipoIncidencia   INT IDENTITY(1,1) CONSTRAINT PK_TipoIncidencia PRIMARY KEY,
    Descripcion        NVARCHAR(120)  NOT NULL
);
CREATE UNIQUE INDEX UX_TipoIncidencia_Descripcion ON dbo.TipoIncidencia(Descripcion);


/* =======================
   Tabla: Denuncia
   (FK a Ciudadano y TipoIncidencia)
   =======================*/
IF OBJECT_ID('dbo.Denuncia') IS NOT NULL DROP TABLE dbo.Denuncia;
GO
CREATE TABLE dbo.Denuncia (
    IdDenuncia        INT IDENTITY(1,1) CONSTRAINT PK_Denuncia PRIMARY KEY,
    IdCiudadano       INT           NOT NULL,
    IdTipoIncidencia  INT           NOT NULL,
    Titulo            NVARCHAR(150) NOT NULL,
    Descripcion       NVARCHAR(MAX) NULL,
    FechaDenuncia     DATETIME2(0)  NOT NULL CONSTRAINT DF_Denuncia_Fecha DEFAULT (SYSUTCDATETIME()),
    Estado            VARCHAR(20)   NOT NULL 
        CONSTRAINT DF_Denuncia_Estado DEFAULT ('PENDIENTE'), -- PENDIENTE | EN_PROCESO | RESUELTA | RECHAZADA
    Latitud           DECIMAL(9,6)  NULL,
    Longitud          DECIMAL(9,6)  NULL,

    CONSTRAINT FK_Denuncia_Ciudadano 
        FOREIGN KEY (IdCiudadano) REFERENCES dbo.Ciudadano(IdCiudadano),

    CONSTRAINT FK_Denuncia_TipoIncidencia
        FOREIGN KEY (IdTipoIncidencia) REFERENCES dbo.TipoIncidencia(IdTipoIncidencia),

    CONSTRAINT CK_Denuncia_Estado 
        CHECK (Estado IN ('PENDIENTE','EN_PROCESO','RESUELTA','RECHAZADA'))
);
-- Índices de apoyo para consultas frecuentes
CREATE INDEX IX_Denuncia_Estado ON dbo.Denuncia(Estado);
CREATE INDEX IX_Denuncia_Tipo ON dbo.Denuncia(IdTipoIncidencia);
CREATE INDEX IX_Denuncia_Ciudadano ON dbo.Denuncia(IdCiudadano);


/* =======================
   Tabla: FotoDenuncia
   (FK a Denuncia) – cascada al borrar
   =======================*/
IF OBJECT_ID('dbo.FotoDenuncia') IS NOT NULL DROP TABLE dbo.FotoDenuncia;
GO
CREATE TABLE dbo.FotoDenuncia (
    IdFoto         INT IDENTITY(1,1) CONSTRAINT PK_FotoDenuncia PRIMARY KEY,
    IdDenuncia     INT           NOT NULL,
    RutaArchivo    NVARCHAR(400) NOT NULL,  -- ruta o URL del archivo
    FechaSubida    DATETIME2(0)  NOT NULL CONSTRAINT DF_FotoDenuncia_Fecha DEFAULT (SYSUTCDATETIME()),

    CONSTRAINT FK_FotoDenuncia_Denuncia
        FOREIGN KEY (IdDenuncia) REFERENCES dbo.Denuncia(IdDenuncia)
        ON DELETE CASCADE
);
CREATE INDEX IX_FotoDenuncia_Denuncia ON dbo.FotoDenuncia(IdDenuncia);


/* =======================
   Tabla: Seguimiento
   (FK a Denuncia y Autoridad)
   =======================*/
IF OBJECT_ID('dbo.Seguimiento') IS NOT NULL DROP TABLE dbo.Seguimiento;
GO
CREATE TABLE dbo.Seguimiento (
    IdSeguimiento    INT IDENTITY(1,1) CONSTRAINT PK_Seguimiento PRIMARY KEY,
    IdDenuncia       INT           NOT NULL,
    IdAutoridad      INT           NOT NULL,
    Comentario       NVARCHAR(MAX) NULL,
    FechaSeguimiento DATETIME2(0)  NOT NULL CONSTRAINT DF_Seguimiento_Fecha DEFAULT (SYSUTCDATETIME()),
    Estado           VARCHAR(20)   NOT NULL 
        CONSTRAINT DF_Seguimiento_Estado DEFAULT ('EN_PROCESO'), -- EN_PROCESO | RESUELTA | ESCALADA | CERRADA
    CONSTRAINT CK_Seguimiento_Estado 
        CHECK (Estado IN ('EN_PROCESO','RESUELTA','ESCALADA','CERRADA')),

    CONSTRAINT FK_Seguimiento_Denuncia
        FOREIGN KEY (IdDenuncia) REFERENCES dbo.Denuncia(IdDenuncia),

    CONSTRAINT FK_Seguimiento_Autoridad
        FOREIGN KEY (IdAutoridad) REFERENCES dbo.Autoridad(IdAutoridad)
);
CREATE INDEX IX_Seguimiento_Denuncia ON dbo.Seguimiento(IdDenuncia);
CREATE INDEX IX_Seguimiento_Autoridad ON dbo.Seguimiento(IdAutoridad);
CREATE INDEX IX_Seguimiento_Estado ON dbo.Seguimiento(Estado);
GO

/* =======================
   Valores de ejemplo (Opcional)
   =======================*/
-- INSERT INTO dbo.TipoIncidencia(Descripcion) VALUES ('Bache'),('Basura acumulada'),('Falta de alumbrado'),('Señalización dañada');
-- INSERT INTO dbo.Ciudadano(Nombres,Apellidos,DNI,Correo,Telefono) VALUES
-- ('Juan','Pérez','11223344','juan@correo.com','999111222');
-- INSERT INTO dbo.Autoridad(Nombres,Apellidos,Cargo,Correo,Telefono) VALUES
-- ('Ana','Ramírez','Gerente Obras','ana@muni.gob.pe','084-123456');
-- INSERT INTO dbo.Denuncia(IdCiudadano,IdTipoIncidencia,Titulo,Descripcion,Latitud,Longitud)
-- VALUES (1,1,'Bache en Av. Principal','Hueco grande frente al parque',-13.516000,-71.978000);
-- INSERT INTO dbo.FotoDenuncia(IdDenuncia,RutaArchivo) VALUES (1,'/uploads/denuncias/1/foto1.jpg');
-- INSERT INTO dbo.Seguimiento(IdDenuncia,IdAutoridad,Comentario,Estado) VALUES
-- (1,1,'Se asignó cuadrilla para inspección','EN_PROCESO');
